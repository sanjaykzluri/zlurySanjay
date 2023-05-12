import _ from "underscore";

/**
 * Deep diff between two object, using underscore
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export const difference = (object, base) => {
	const changes = (object, base) =>
		_.pick(
			_.mapObject(object, (value, key) =>
				!_.isEqual(value, base[key])
					? _.isObject(value) && _.isObject(base[key])
						? changes(value, base[key])
						: value
					: null
			),
			(value) => value !== null
		);
	return changes(object, base);
};
