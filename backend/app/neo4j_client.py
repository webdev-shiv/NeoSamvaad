import logging
from typing import Any, Dict, List, Optional
from neo4j import GraphDatabase, Driver, Session
from neo4j.exceptions import ServiceUnavailable, AuthError, Neo4jError

try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass

try:
    from app.config import get_settings, Settings
except ImportError:
    from .config import get_settings, Settings

logger = logging.getLogger("neo4j_client")


class Neo4jClient:
    """Manages connection and query execution to the Neo4j graph database."""

    def __init__(self, settings: Optional[Settings] = None):
        self.settings = settings or get_settings()
        self._driver: Optional[Driver] = None

    def get_driver(self) -> Driver:
        """Lazily initialize and return the Neo4j driver."""
        if self._driver is None:
            if not self.settings.is_neo4j_configured:
                raise ValueError("Neo4j is not configured. Please supply valid NEO4J_URI and credentials.")
            try:
                self._driver = GraphDatabase.driver(
                    self.settings.neo4j_uri,
                    auth=(self.settings.neo4j_username, self.settings.neo4j_password),
                    max_connection_lifetime=30 * 60,
                    max_connection_pool_size=50,
                    connection_acquisition_timeout=10.0,
                )
            except Exception as e:
                logger.error(f"Failed to initialize Neo4j driver: {e}")
                raise
        return self._driver

    def verify_connectivity(self) -> bool:
        """Check if Neo4j is reachable and authentication is valid."""
        if not self.settings.is_neo4j_configured:
            return False
        try:
            driver = self.get_driver()
            driver.verify_connectivity()
            return True
        except (ServiceUnavailable, AuthError, Neo4jError, Exception) as e:
            logger.warning(f"Neo4j connectivity check failed: {e}")
            return False

    def close(self):
        """Close driver connections."""
        if self._driver is not None:
            self._driver.close()
            self._driver = None

    def execute_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        database: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Execute a Cypher query using safe parameterized execution.
        Parameters must always be passed as a dictionary, never interpolated into the query string.
        """
        driver = self.get_driver()
        safe_params = parameters or {}
        
        with driver.session(database=database) as session:
            result = session.run(query, safe_params)
            return [record.data() for record in result]

    def execute_write(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        database: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Execute a write transaction using safe parameters."""
        driver = self.get_driver()
        safe_params = parameters or {}

        def _work(tx):
            result = tx.run(query, safe_params)
            return [record.data() for record in result]

        with driver.session(database=database) as session:
            return session.execute_write(_work)

    def apply_cypher_script(self, cypher_script: str) -> List[int]:
        """
        Execute multiple Cypher statements separated by semicolons.
        Uses quote-aware splitting to avoid breaking on semicolons inside string literals.
        """
        raw_statements = []
        current = []
        in_single_quote = False
        in_double_quote = False
        escaped = False

        for char in cypher_script:
            if escaped:
                current.append(char)
                escaped = False
                continue
            if char == "\\":
                current.append(char)
                escaped = True
                continue
            if char == "'" and not in_double_quote:
                in_single_quote = not in_single_quote
                current.append(char)
                continue
            if char == '"' and not in_single_quote:
                in_double_quote = not in_double_quote
                current.append(char)
                continue
            if char == ";" and not in_single_quote and not in_double_quote:
                raw_statements.append("".join(current))
                current = []
                continue
            current.append(char)

        if current:
            raw_statements.append("".join(current))

        results_count = []
        for raw in raw_statements:
            cleaned_lines = [
                line for line in raw.splitlines()
                if not line.strip().startswith("//")
            ]
            cleaned_stmt = "\n".join(cleaned_lines).strip()
            if cleaned_stmt:
                res = self.execute_query(cleaned_stmt)
                results_count.append(len(res))
        return results_count


_client_instance: Optional[Neo4jClient] = None


def get_neo4j_client() -> Neo4jClient:
    """Return a shared Neo4jClient instance."""
    global _client_instance
    if _client_instance is None:
        _client_instance = Neo4jClient()
    return _client_instance
