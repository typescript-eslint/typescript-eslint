import React from 'react';

class Hello extends React.Component<{ tag: () => JSX.Element }> {
  inline() {
    return [<this.props.tag />, <this />];
  }
}
