import pkgutil
import importlib


def register_all():
    # import all modules in "nodes" directory and export subclasses of Node
    for loader, pkg_name, is_pkg in pkgutil.walk_packages(__path__):
        # relative import of module
        importlib.import_module(f'.{pkg_name}', __name__)


__all__ = ['register_all']


# append all subclasses of Node in module to __all__
# for cls_name, cls in inspect.getmembers(module, inspect.isclass):
#     if cls.__module__ == pkg_name and issubclass(cls, Node) and not cls_name.startswith('_'):
#         globals()[cls_name] = cls
#         __all__.append(cls_name)
