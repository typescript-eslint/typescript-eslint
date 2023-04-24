import React, { useCallback, useMemo } from 'react';
import type * as ts from 'typescript';

import ASTViewer from '../ast/ASTViewer';
import astStyles from '../ast/ASTViewer.module.css';
import type { OnHoverNodeFn } from '../ast/types';
import { isRecord, isTSNode } from '../ast/utils';

export interface TypeInfoProps {
  readonly value: ts.Node;
  readonly typeChecker?: ts.TypeChecker;
  readonly onHoverNode?: OnHoverNodeFn;
  readonly onSelect: (value: ts.Node) => void;
}

interface InfoModel {
  type?: unknown;
  typeString?: string;
  contextualType?: unknown;
  contextualTypeString?: string;
  symbol?: unknown;
  signature?: unknown;
  flowNode?: unknown;
}

interface SimpleFieldProps {
  readonly value: string | undefined;
  readonly label: string;
}

interface TypeGroupProps {
  readonly label: string;
  readonly type?: unknown;
  readonly string?: string;
  readonly onHoverNode?: OnHoverNodeFn;
}

function SimpleField(props: SimpleFieldProps): JSX.Element {
  return (
    <div className={astStyles.list}>
      <span className={astStyles.propClass}>{props.label}</span>
      <span>: </span>
      <span className={astStyles.propString}>{String(props.value)}</span>
    </div>
  );
}

function TypeGroup(props: TypeGroupProps): JSX.Element {
  return (
    <>
      <h4 className="padding--sm margin--none">{props.label}</h4>
      {(props.type && (
        <>
          {props.string && (
            <SimpleField value={props.string} label="typeToString()" />
          )}
          <ASTViewer onHoverNode={props.onHoverNode} value={props.type} />
        </>
      )) || <div className={astStyles.list}>None</div>}
    </>
  );
}

export function TypeInfo({
  value,
  typeChecker,
  onHoverNode,
  onSelect,
}: TypeInfoProps): JSX.Element {
  const computed = useMemo(() => {
    if (!typeChecker || !value) {
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
      // @ts-expect-error just fail if node type is not correct
      const contextualType = typeChecker.getContextualType(value);
      info.contextualType = contextualType;
      if (contextualType) {
        info.contextualTypeString = typeChecker.typeToString(contextualType);
      }
    } catch (_e: unknown) {
      info.contextualType = undefined;
    }
    return info;
  }, [value, typeChecker]);

  const onSelectNode = useCallback(
    (selection: unknown) => {
      if (isRecord(selection) && isTSNode(selection) && value !== selection) {
        onSelect(selection);
        onHoverNode?.(undefined);
      }
    },
    [onSelect, onHoverNode, value],
  );

  if (!typeChecker || !computed) {
    return <div>TypeChecker not available</div>;
  }

  return (
    <div>
      <>
        <h4 className="padding--sm margin--none">Node</h4>
        <ASTViewer
          onClickNode={onSelectNode}
          onHoverNode={onHoverNode}
          value={value}
        />
        <TypeGroup
          label="Type"
          type={computed.type}
          string={computed.typeString}
          onHoverNode={onHoverNode}
        />
        <TypeGroup
          label="Contextual Type"
          type={computed.contextualType}
          string={computed.contextualTypeString}
          onHoverNode={onHoverNode}
        />
        <TypeGroup
          label="Symbol"
          type={computed.symbol}
          onHoverNode={onHoverNode}
        />
        <TypeGroup
          label="Signature"
          type={computed.signature}
          onHoverNode={onHoverNode}
        />
        <TypeGroup
          label="FlowNode"
          type={computed.flowNode}
          onHoverNode={onHoverNode}
        />
      </>
    </div>
  );
}
