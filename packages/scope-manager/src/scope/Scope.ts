import type { BlockScope } from './BlockScope';
import type { CatchScope } from './CatchScope';
import type { ClassFieldInitializerScope } from './ClassFieldInitializerScope';
import type { ClassStaticBlockScope } from './ClassStaticBlockScope';
import type { ClassScope } from './ClassScope';
import type { ConditionalTypeScope } from './ConditionalTypeScope';
import type { ForScope } from './ForScope';
import type { FunctionExpressionNameScope } from './FunctionExpressionNameScope';
import type { FunctionScope } from './FunctionScope';
import type { FunctionTypeScope } from './FunctionTypeScope';
import type { GlobalScope } from './GlobalScope';
import type { MappedTypeScope } from './MappedTypeScope';
import type { ModuleScope } from './ModuleScope';
import type { SwitchScope } from './SwitchScope';
import type { TSEnumScope } from './TSEnumScope';
import type { TSModuleScope } from './TSModuleScope';
import type { TypeScope } from './TypeScope';
import type { WithScope } from './WithScope';

type Scope =
  | BlockScope
  | CatchScope
  | ClassScope
  | ClassFieldInitializerScope
  | ClassStaticBlockScope
  | ConditionalTypeScope
  | ForScope
  | FunctionExpressionNameScope
  | FunctionScope
  | FunctionTypeScope
  | GlobalScope
  | MappedTypeScope
  | ModuleScope
  | SwitchScope
  | TSEnumScope
  | TSModuleScope
  | TypeScope
  | WithScope;

export { Scope };
