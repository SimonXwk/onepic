from functools import wraps
from flask import request, render_template, redirect, url_for, g, Blueprint
import pandas


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def template_applied(template=None, absolute=False, extension='.html'):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            template_name = template
            """ Process the template variable and construct the template_name for flask.render_template(template_name)
            Replace '.' in request.endpoint with '/'
            Case 1: No template provided, use the /endpoint.html
            Case 2: template provided as absolute path to root, template.html instead
            Case 3: template provided as a name only, use the /endpoint(take out last part) + template.html 
            """
            if template_name is None:
                template_name = request.endpoint.replace('.', '/') + extension
            elif not absolute:
                template_name = '/'.join((request.endpoint.rsplit('.', 2)[0].replace('.', '/'), template + extension))
            else:
                template_name = template + extension
            # Run the wrapped function, which should return a dictionary of Parameters
            dic = f(*args, **kwargs)
            if dic is None:
                dic = {}
            elif not isinstance(dic, dict):
                return dic
            # Render the template
            return render_template(template_name, **dic)
        return decorated_function
    return decorator


def create_blueprint(blueprint_name, module_name, prefixed=True):
    mod = Blueprint(blueprint_name, module_name, static_folder='static', template_folder='templates', url_prefix='/' + blueprint_name if prefixed else '')
    """ The variable 'blueprint_name' is required in jinja template(_layout_view.html) to locate resources under the blueprint module
    Those resources includes are but not limited to:
    template file under blueprint/templates/blueprint/<filename>;
    css file under blueprint/static/css/<filename>;
    javascript file under blueprint/static/js/<filename>
    In this way the macro in the global template will only need the file name without worrying about the specific path to prefix the filename
    * You need to make sure the sub folder under the templates folder in blueprint is using the blueprint's name
    """

    @mod.context_processor
    def inject_blueprint_name():
        return dict(blueprint_name=mod.name)

    return mod


def to_data_frame(header=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Run the wrapped function, which should return (())/[[]]/generator
            data = f(*args, **kwargs)
            df = pandas.DataFrame(data)
            if header:
                df.columns = header
            return df
        return decorated_function
    return decorator
