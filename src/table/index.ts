import createStore from './store';



const store = createStore(this, {
    rowKey: this.rowKey,
    defaultExpandAll: this.defaultExpandAll,
    selectOnIndeterminate: this.selectOnIndeterminate,
    // TreeTable 的相关配置
    indent: this.indent,
    lazy: this.lazy,
    lazyColumnIdentifier: hasChildren,
    childrenColumnName: children
  });

  store