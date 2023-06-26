import { PredefinedFormats } from './enums';

/*
These format functions are taken from `tslint-consistent-codestyle/naming-convention`:
https://github.com/ajafff/tslint-consistent-codestyle/blob/ab156cc8881bcc401236d999f4ce034b59039e81/rules/namingConventionRule.ts#L603-L645

The license for the code can be viewed here:
https://github.com/ajafff/tslint-consistent-codestyle/blob/ab156cc8881bcc401236d999f4ce034b59039e81/LICENSE
*/

/*
Why not regex here? Because it's actually really, really difficult to create a regex to handle
all of the unicode cases, and we have many non-english users that use non-english characters.
https://gist.github.com/mathiasbynens/6334847
*/

function isPascalCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name[0] === name[0].toUpperCase() && !name.includes('_'))
  );
}
function isStrictPascalCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name[0] === name[0].toUpperCase() && hasStrictCamelHumps(name, true))
  );
}

function isCamelCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name[0] === name[0].toLowerCase() && !name.includes('_'))
  );
}
function isStrictCamelCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name[0] === name[0].toLowerCase() && hasStrictCamelHumps(name, false))
  );
}

function hasStrictCamelHumps(name: string, isUpper: boolean): boolean {
  function isUppercaseChar(char: string): boolean {
    return char === char.toUpperCase() && char !== char.toLowerCase();
  }

  if (name.startsWith('_')) {
    return false;
  }
  for (let i = 1; i < name.length; ++i) {
    if (name[i] === '_') {
      return false;
    }
    if (isUpper === isUppercaseChar(name[i])) {
      if (isUpper) {
        return false;
      }
    } else {
      isUpper = !isUpper;
    }
  }
  return true;
}

function isSnakeCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name === name.toLowerCase() && validateUnderscores(name))
  );
}

function isUpperCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name === name.toUpperCase() && validateUnderscores(name))
  );
}

/** Check for leading trailing and adjacent underscores */
function validateUnderscores(name: string): boolean {
  if (name.startsWith('_')) {
    return false;
  }
  let wasUnderscore = false;
  for (let i = 1; i < name.length; ++i) {
    if (name[i] === '_') {
      if (wasUnderscore) {
        return false;
      }
      wasUnderscore = true;
    } else {
      wasUnderscore = false;
    }
  }
  return !wasUnderscore;
}

const PredefinedFormatToCheckFunction: Readonly<
  Record<PredefinedFormats, (name: string) => boolean>
> = {
  [PredefinedFormats.PascalCase]: isPascalCase,
  [PredefinedFormats.StrictPascalCase]: isStrictPascalCase,
  [PredefinedFormats.camelCase]: isCamelCase,
  [PredefinedFormats.strictCamelCase]: isStrictCamelCase,
  [PredefinedFormats.UPPER_CASE]: isUpperCase,
  [PredefinedFormats.snake_case]: isSnakeCase,
};

export { PredefinedFormatToCheckFunction };
