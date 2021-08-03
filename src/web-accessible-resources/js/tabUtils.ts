const { TabContext } = require("./tabContext");

class TabUtils {
  /** @type {TabContext} */
  tabContext;

  /** @param {TabContext} tabContext */
  constructor(tabContext) {
    this.tabContext = tabContext;
  }
}
exports.TabUtils = TabUtils;
