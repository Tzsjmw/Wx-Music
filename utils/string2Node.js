// 转成node节点
/**
 *
 * @param {string} keyword 需要被转为node的字符串
 * @param {string} matchWord 需要被匹配的字符串
 */
export function string2Node(keyword, matchWord) {
  const node = [];
  // 以搜索的关键字开头的联想
  if (keyword.toUpperCase().startsWith(matchWord.toUpperCase())) {
    // 1.匹配的字符前一节字符
    const key1 = keyword.slice(0, matchWord.length);
    // 将这一节渲染成想要的效果
    const node1 = {
      name: "span",
      attrs: { style: "color: #2aca83" },
      children: [{ type: "text", text: key1 }],
    };
    node.push(node1);
    // 2.不匹配的
    const key2 = keyword.slice(matchWord.length);
    const node2 = {
      name: "span",
      attrs: {},
      children: [{ type: "text", text: key2 }],
    };
    node.push(node2);
  } else {
    // 不匹配的情况, 直接将一整个作为一个node节点
    const node1 = {
      name: "span",
      attrs: {},
      children: [{ type: "text", text: keyword }],
    };
    node.push(node1);
  }
  return node;
}
