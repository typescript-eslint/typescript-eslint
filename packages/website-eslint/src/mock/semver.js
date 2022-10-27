import satisfies from 'semver/functions/satisfies';
import major from 'semver/functions/major';

// just in case someone adds a import * as semver usage
export { satisfies, major };

export default { satisfies, major };
