from functools import wraps
import pandas as pd


def to_data_frame(header=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Run the wrapped function, which should return (())/[[]]/generator
            data = f(*args, **kwargs)
            df = pd.DataFrame(data)
            if header:
                df.columns = header
            return df
        return decorated_function
    return decorator
