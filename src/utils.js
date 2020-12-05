const extractSelector = (input) => {
  let selectors = Object.entries(input).map((arr) => {
    arr[1] = arr[1].replace(/:nth-child\(\d+\)/, "");
    return arr;
  });
  let selParent = null;
  let maxChildren = 0;
  for (let i = 0; i < selectors.length; i++) {
    const ele = selectors[i][1];
    let countChildren = 0;
    for (let j = 0; j < selectors.length; j++) {
      const nextEle = selectors[j][1];
      if (ele !== nextEle && nextEle.includes(ele)) {
        countChildren++;
      }
    }
    if (countChildren > maxChildren) {
      selParent = ele;
      maxChildren = countChildren;
    }
  }
  selectors = selectors.map(arr => {
    if (selParent !== arr[1] && arr[1].includes(selParent)) {
      arr[1] = arr[1].replace(`${selParent} > `, '')
    }
    return arr;
  })
  return Object.fromEntries(selectors);
}
module.exports = {extractSelector};