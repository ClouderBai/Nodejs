import TreeStore from "./tree-store";



const options = {
    nodeKey: 'label',
    data: [{
        label: '一级 1',
        children: [{
            label: '二级 1-1',
            children: [{
                label: '三级 1-1-1'
            }]
        }]
    }, {
        label: '一级 2',
        children: [{
            label: '二级 2-1',
            children: [{
                label: '三级 2-1-1'
            }]
        }, {
            label: '二级 2-2',
            children: [{
                label: '三级 2-2-1'
            }]
        }]
    }, {
        label: '一级 3',
        children: [{
            label: '二级 3-1',
            children: [{
                label: '三级 3-1-1'
            }]
        }, {
            label: '二级 3-2',
            children: [{
                label: '三级 3-2-1'
            }]
        }]
    }],
    props: {
        children: 'children',
        label: 'label'
    }
}

const store = new TreeStore({
    key: options.nodeKey,
    data: options.data,
    lazy: options.lazy,
    props: options.props,
    load: options.load,
    currentNodeKey: options.currentNodeKey,
    checkStrictly: options.checkStrictly,
    checkDescendants: options.checkDescendants,
    defaultCheckedKeys: options.defaultCheckedKeys,
    defaultExpandedKeys: options.defaultExpandedKeys,
    autoExpandParent: options.autoExpandParent,
    defaultExpandAll: options.defaultExpandAll,
    filterNodeMethod: options.filterNodeMethod
});


store
//   let dragState = this.dragState;
//   this.$on('tree-node-drag-start', (event, treeNode) => {
//     if (typeof this.allowDrag === 'function' && !this.allowDrag(treeNode.node)) {
//       event.preventDefault();
//       return false;
//     }
//     event.dataTransfer.effectAllowed = 'move';
//     // wrap in try catch to address IE's error when first param is 'text/plain'
//     try {
//       // setData is required for draggable to work in FireFox
//       // the content has to be '' so dragging a node out of the tree won't open a new tab in FireFox
//       event.dataTransfer.setData('text/plain', '');
//     } catch (e) {}
//     dragState.draggingNode = treeNode;
//     this.$emit('node-drag-start', treeNode.node, event);
//   });
//   this.$on('tree-node-drag-over', (event, treeNode) => {
//     const dropNode = findNearestComponent(event.target, 'ElTreeNode');
//     const oldDropNode = dragState.dropNode;
//     if (oldDropNode && oldDropNode !== dropNode) {
//       removeClass(oldDropNode.$el, 'is-drop-inner');
//     }
//     const draggingNode = dragState.draggingNode;
//     if (!draggingNode || !dropNode) return;
//     let dropPrev = true;
//     let dropInner = true;
//     let dropNext = true;
//     let userAllowDropInner = true;
//     if (typeof this.allowDrop === 'function') {
//       dropPrev = this.allowDrop(draggingNode.node, dropNode.node, 'prev');
//       userAllowDropInner = dropInner = this.allowDrop(draggingNode.node, dropNode.node, 'inner');
//       dropNext = this.allowDrop(draggingNode.node, dropNode.node, 'next');
//     }
//     event.dataTransfer.dropEffect = dropInner ? 'move' : 'none';
//     if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
//       if (oldDropNode) {
//         this.$emit('node-drag-leave', draggingNode.node, oldDropNode.node, event);
//       }
//       this.$emit('node-drag-enter', draggingNode.node, dropNode.node, event);
//     }
//     if (dropPrev || dropInner || dropNext) {
//       dragState.dropNode = dropNode;
//     }
//     if (dropNode.node.nextSibling === draggingNode.node) {
//       dropNext = false;
//     }
//     if (dropNode.node.previousSibling === draggingNode.node) {
//       dropPrev = false;
//     }
//     if (dropNode.node.contains(draggingNode.node, false)) {
//       dropInner = false;
//     }
//     if (draggingNode.node === dropNode.node || draggingNode.node.contains(dropNode.node)) {
//       dropPrev = false;
//       dropInner = false;
//       dropNext = false;
//     }
//     const targetPosition = dropNode.$el.getBoundingClientRect();
//     const treePosition = this.$el.getBoundingClientRect();
//     let dropType;
//     const prevPercent = dropPrev ? (dropInner ? 0.25 : (dropNext ? 0.45 : 1)) : -1;
//     const nextPercent = dropNext ? (dropInner ? 0.75 : (dropPrev ? 0.55 : 0)) : 1;
//     let indicatorTop = -9999;
//     const distance = event.clientY - targetPosition.top;
//     if (distance < targetPosition.height * prevPercent) {
//       dropType = 'before';
//     } else if (distance > targetPosition.height * nextPercent) {
//       dropType = 'after';
//     } else if (dropInner) {
//       dropType = 'inner';
//     } else {
//       dropType = 'none';
//     }
//     const iconPosition = dropNode.$el.querySelector('.el-tree-node__expand-icon').getBoundingClientRect();
//     const dropIndicator = this.$refs.dropIndicator;
//     if (dropType === 'before') {
//       indicatorTop = iconPosition.top - treePosition.top;
//     } else if (dropType === 'after') {
//       indicatorTop = iconPosition.bottom - treePosition.top;
//     }
//     dropIndicator.style.top = indicatorTop + 'px';
//     dropIndicator.style.left = (iconPosition.right - treePosition.left) + 'px';
//     if (dropType === 'inner') {
//       addClass(dropNode.$el, 'is-drop-inner');
//     } else {
//       removeClass(dropNode.$el, 'is-drop-inner');
//     }
//     dragState.showDropIndicator = dropType === 'before' || dropType === 'after';
//     dragState.allowDrop = dragState.showDropIndicator || userAllowDropInner;
//     dragState.dropType = dropType;
//     this.$emit('node-drag-over', draggingNode.node, dropNode.node, event);
//   });
//   this.$on('tree-node-drag-end', (event) => {
//     const { draggingNode, dropType, dropNode } = dragState;
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//     if (draggingNode && dropNode) {
//       const draggingNodeCopy = { data: draggingNode.node.data };
//       if (dropType !== 'none') {
//         draggingNode.node.remove();
//       }
//       if (dropType === 'before') {
//         dropNode.node.parent.insertBefore(draggingNodeCopy, dropNode.node);
//       } else if (dropType === 'after') {
//         dropNode.node.parent.insertAfter(draggingNodeCopy, dropNode.node);
//       } else if (dropType === 'inner') {
//         dropNode.node.insertChild(draggingNodeCopy);
//       }
//       if (dropType !== 'none') {
//         this.store.registerNode(draggingNodeCopy);
//       }
//       removeClass(dropNode.$el, 'is-drop-inner');
//       this.$emit('node-drag-end', draggingNode.node, dropNode.node, dropType, event);
//       if (dropType !== 'none') {
//         this.$emit('node-drop', draggingNode.node, dropNode.node, dropType, event);
//       }
//     }
//     if (draggingNode && !dropNode) {
//       this.$emit('node-drag-end', draggingNode.node, null, dropType, event);
//     }
//     dragState.showDropIndicator = false;
//     dragState.draggingNode = null;
//     dragState.dropNode = null;
//     dragState.allowDrop = true;
//   });