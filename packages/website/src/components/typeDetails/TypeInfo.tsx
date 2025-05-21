import type * as ts from 'typescript';

import React, { useMemo } from 'react';

import type { OnHoverNodeFn } from '../ast/types';

import ASTViewer from '../ast/ASTViewer';
import astStyles from '../ast/ASTViewer.module.css';

export interface TypeInfoProps {
  readonly onHoverNode?: OnHoverNodeFn;
  readonly typeChecker?: ts.TypeChecker;
  readonly value: ts.Node;
}

interface InfoModel {
  contextualType?: unknown;
  contextualTypeString?: string;
  flowNode?: unknown;
  signature?: unknown;
  symbol?: unknown;
  type?: unknown;
  typeString?: string;
}

interface SimpleFieldProps {
  readonly label: string;
  readonly value: string | undefined;
}

interface TypeGroupProps {
  readonly label: string;
  readonly onHoverNode?: OnHoverNodeFn;
  readonly string?: string;
  readonly type?: unknown;
}

function SimpleField(props: SimpleFieldProps): React.JSX.Element {
  return (
    <div className={astStyles.list}>
      <span className={astStyles.propClass}>{props.label}</span>
      <span>: </span>
      <span className={astStyles.propString}>{String(props.value)}</span>
    </div>
  );
}

function TypeGroup(props: TypeGroupProps): React.JSX.Element {
  return (
    <>
      <h4 className="padding--sm margin--none">{props.label}</h4>
      {props.type ? (
        <>
          {props.string && (
            <SimpleField label="typeToString()" value={props.string} />
          )}
          <ASTViewer onHoverNode={props.onHoverNode} value={props.type} />
        </>
      ) : (
        <div className={astStyles.list}>None</div>
      )}
    </>
  );
}

export function TypeInfo({
  onHoverNode,
  typeChecker,
  value,
}: TypeInfoProps): React.JSX.Element {
  const computed = useMemo(() => {
    if (!typeChecker) {
      return undefined;
    }
    const info: InfoModel = {};
    try {
      const type = typeChecker.getTypeAtLocation(value);
      info.type = type;
      info.typeString = typeChecker.typeToString(type);
      info.symbol = type.getSymbol();
      let signature = type.getCallSignatures();
      if (signature.length === 0) {
        signature = type.getConstructSignatures();
      }
      info.signature = signature.length > 0 ? signature : undefined;
      // @ts-expect-error not part of public api
      info.flowNode = value.flowNode ?? value.endFlowNode ?? undefined;
    } catch (e: unknown) {
      info.type = e;
    }
    try {
      // @ts-expect-error just fail if a node type is not correct
      const contextualType = typeChecker.getContextualType(value);
      info.contextualType = contextualType;
      if (contextualType) {
        info.contextualTypeString = typeChecker.typeToString(contextualType);
      }
    } catch {
      info.contextualType = undefined;
    }
    return info;
  }, [value, typeChecker]);

  if (!typeChecker || !computed) {
    return <div>TypeChecker not available</div>;
  }

  return (
    <div>
      <>
        <h4 className="padding--sm margin--none">Node</h4>
        <ASTViewer onHoverNode={onHoverNode} value={value} />
        <TypeGroup
          label="Type"
          onHoverNode={onHoverNode}
          string={computed.typeString}
          type={computed.type}
        />
        <TypeGroup
          label="Contextual Type"
          onHoverNode={onHoverNode}
          string={computed.contextualTypeString}
          type={computed.contextualType}
        />
        <TypeGroup
          label="Symbol"
          onHoverNode={onHoverNode}
          type={computed.symbol}
        />
        <TypeGroup
          label="Signature"
          onHoverNode={onHoverNode}
          type={computed.signature}
        />
        <TypeGroup
          label="FlowNode"
          onHoverNode={onHoverNode}
          type={computed.flowNode}
        />
      </>
    </div>
  );
}
