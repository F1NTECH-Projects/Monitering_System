from cachetools import TTLCache
import threading
from typing import Optional, Dict, Any

# Thread-safe cache
_clinic_cache = TTLCache(maxsize=1000, ttl=300)
_cache_lock = threading.RLock()

def get_cached_clinic(clinic_id: str) -> Optional[Dict[str, Any]]:
    """Get clinic from cache."""
    with _cache_lock:
        return _clinic_cache.get(clinic_id)

def set_cached_clinic(clinic_id: str, data: Dict[str, Any]):
    """Cache clinic data."""
    with _cache_lock:
        _clinic_cache[clinic_id] = data

def invalidate_clinic_cache(clinic_id: str):
    """Invalidate clinic cache on updates."""
    with _cache_lock:
        _clinic_cache.pop(clinic_id, None)

def clear_all_cache():
    """Clear all caches."""
    with _cache_lock:
        _clinic_cache.clear()
