// jquery-ui only works on Browser globals (see jquery-ui/ui/widget.js)
export default ($: JQueryStatic) => {
  (<any>window).$ = (<any>window).jQuery = $;
  require("jquery-ui/ui/version");
  require("jquery-ui/ui/widget");
  require("jquery-ui/ui/data");
  require("jquery-ui/ui/disable-selection");
  require("jquery-ui/ui/scroll-parent");
  require("jquery-ui/ui/ie");
  require("jquery-ui/ui/widgets/mouse");
  require("jquery-ui/ui/plugin");
  require("jquery-ui/ui/safe-active-element");
  require("jquery-ui/ui/safe-blur");
  require("jquery-ui/ui/widgets/draggable");
  require("jquery-ui/ui/widgets/resizable");
  $.noConflict(true);
};
