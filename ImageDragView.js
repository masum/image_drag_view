$.fn.extend({
  ImageDragView: function(param) {
    $this = this;
    var getCenter = function() {
      var img = $("#map");
      var x = -(parseInt(img.css("left"))) + $this.width()/2 - -(img.offset().left);
      var y = -(parseInt(img.css("top"))) + $this.height()/2 - -(img.offset().top);
      return {x:x,y:y}
    }
    this.css({overflow:"hidden",position:"relative"});
    var defaultSize;
    var map=$("<img id='map'>").appendTo(this).attr("src",param.image)
         .css({position:"relative",cursor:"move",left:"0px"})
         .bind("load",function() {
            defaultSize = {width:$(this).width(),height:$(this).height()}
          });
    var p=$("<img id='plus' src='p.png'>").appendTo(this)
         .css({cursor:"pointer",position:"absolute",left:10,top:10})
         .bind("click",function(e) {
           var pos = getCenter();
           zoom($("#map"),pos,1.5);
         });
    var h=$("<img id='home' src='c.png'>").appendTo(this)
         .css({cursor:"pointer",position:"absolute",left:10,top:30})
         .bind("click",function(e) {
           var pos = getCenter();
           zoomDefault($("#map"),pos);
         });
    var m=$("<img id='minus' src='m.png'>").appendTo(this)
         .css({cursor:"pointer",position:"absolute",left:10,top:50})
         .bind("click",function(e) {
           var pos = getCenter();
           zoom($("#map"),pos,0.5);
         });
    var resetEvent = function(e) {
      e.unbind("mousemove.move").unbind("mouseup.up");
    };
    var callback = function(zoom) {
      var obj = {}
      var img=$("#map");
      obj.ratio = img.width() / defaultSize.width;
      obj.left = -(parseInt(img.css("left")));
      obj.top = -(parseInt(img.css("top")));
      obj.right = obj.left + $this.width();
      obj.bottom = obj.top + $this.height();
      obj.zoom = zoom;
      param.callback(obj);
    };
    var zoom = function(img,pt,ratio) {
      var newLeft = -(((pt.x - img.offset().left) * ratio)- $this.width()/2);
      var newTop  = -(((pt.y - img.offset().top)  * ratio) - $this.height()/2);
      var pt = roundPoint(newLeft,newTop,img.width()*ratio,img.height()*ratio);
      img.animate({
        width:img.width()*ratio,
        left:pt.left,
        top:pt.top
      },{
        duration:"fast",
        complete: function() {
          callback(true);
        }
      });
    }
    var zoomDefault = function(img,pt) {
      var ratio = defaultSize.width / $("#map").width();
      zoom(img,pt,ratio);
    }
    var roundPoint = function(left,top,width,height) {
      var pt = {left:left,top:top};
      if (pt.left > 0) pt.left = 0;
      if (pt.top > 0) pt.top = 0;
      if ((-(pt.left)+$this.width()) > width) {
        pt.left = -(width-$this.width());
      }
      if ( (-(pt.top)+$this.height()) > height) {
        pt.top = -(height-$this.height());
      }
      return pt;
    }
/*
    var debug=function(e) {
      var img=$("#map");
      var ratio = defaultSize.width / $("#map").width();
      var buf="";
      buf += "img.css.left("+img.css("left")+") ";
      buf += "img.off.left("+img.offset().left+") ";
      buf += "e.pageX("+e.pageX+") ";
      buf += "e.clientX("+e.clientX+") ";
      buf += "img.width("+img.width()+") ";
      buf += "ratio("+ ratio +") ";

      buf += "l("+ -(parseInt(img.css("left"))) + ")/";
      buf += "r("+ (-(parseInt(img.css("left"))) + $this.width()) + ")";

      console.log(buf);
    }
*/
    var drag=false;
    map.bind("mousedown.down",function(e) {
      var fromX = e.clientX;
      var fromY = e.clientY;
      var img = $(e.target);
      img.bind("mousemove.move",function(e) {
        drag=true;
        var left = parseInt(img.css("left")) + (e.clientX-fromX);
        var top  = parseInt(img.css("top"))  + (e.clientY-fromY);
        var pt = roundPoint(left,top,img.width(),img.height());
        img.css({left:pt.left,top:pt.top});
        fromX = e.clientX;
        fromY = e.clientY;
        if(drag) callback(false);
      }).bind("mouseover.over",function(e) {
        if(drag) callback(false);
        drag=false;
        resetEvent($(e.target));
      }).bind("mouseup.up",function(e) {
        if(drag) callback(false);
        drag=false;
        resetEvent($(e.target));
      });
      return false;
    }).dblclick(function(e) {
      zoom($(e.target),{x:e.pageX,y:e.pageY},1.5);
    });
    var target = map.get()[0];
    if (typeof target.onselectstart != "undefined") {
      target.onselectstart = function(){return false}
    } else if (typeof target.style.MozUserSelect != "undefined") {
      target.style.MozUserSelect = "none"
    } else {
      target.onmousedown = function(){return false}
    };
  }
});
