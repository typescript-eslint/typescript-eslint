import major from 'semver/functions/major';
import satisfies from 'semver/functions/satisfies';

// just in case someone adds a import * as semver usage
export { satisfies, major };

export default { satisfies, major };
