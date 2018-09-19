from flask import current_app
import os
import json


class NPM(object):
	__base_dir = current_app.root_path.rsplit(os.sep, 1)[0]

	@classmethod
	def read_package_json(cls):
			with open(os.path.join(cls.__base_dir, 'package.json')) as f:
				return json.load(f)

	@classmethod
	def read_dependencies(cls):
		return cls.read_package_json().get('dependencies', {})

	@classmethod
	def read_dependency(cls, dependency, parse_version=True):
		version_string = cls.read_dependencies().get(dependency, '')
		if parse_version:
			return cls.__parse_version(version_string)
		return version_string

	@classmethod
	def __parse_version(cls, version_str):
		version = ''
		for char in version_str:
			if char.isdigit() or char == '.':
				version += char
		return version
