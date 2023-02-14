import major from 'semver/functions/major';
import satisfies from 'semver/functions/satisfies';

// just in case someone adds a import * as semver usage
export { satisfies, major };

// eslint-disable-next-line import/no-default-export
export default { satisfies, major };
