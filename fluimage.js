// adds .naturalWidth() and .naturalHeight() methods to jQuery
// for retreaving a normalized naturalWidth and naturalHeight.
// by Jack Moore
// http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie
(function($){
  var
  props = ['Width', 'Height'],
  prop;

  while (prop = props.pop()) {
    (function (natural, prop) {
      $.fn[natural] = (natural in new Image()) ? 
      function () {
        return this[0][natural];
      } : 
      function () {
        var 
        node = this[0],
        img,
        value;

        if (node.tagName.toLowerCase() === 'img') {
          img = new Image();
          img.src = node.src,
          value = img[prop];
        }
        return value;
      };
    }('natural' + prop, prop.toLowerCase()));
  }
}(jQuery));

// Fluimage.js 
// Fluid Image Library Thing for jQuery
// Hector G. Parra Alvarez, 2012 
//
// if change a parameter (flowing type, focal area) you must explicitly resize image
(function($) {
 	
    var methods = {
	
	//
	init: function(options) {
	    return this.each(function() {
		// only images
		if (this.nodeName === "IMG") {
		    // nothin here
		}
	    });
	},

	// return ratio of image with respect to its original size
	// not chainable
	ratio: function() {
	    // we assume other dimesion is the same
	    // we couldnt' check for equality reliably between FPs anyway
	    return this.width() / this.naturalWidth();
	},

	// focal getter/setter
	// focal information always stored in HTML data relative to natural dimensions
	focal: function(attrs) {

	    var img = this;
	    
	    // TODO: error checking?
	    // if focal.coord + focal.dim > natural.dim throw error

	    if (attrs) {
		// TODO: change them
	    }

	    // http://en.wikipedia.org/wiki/Focal_point_(disambiguation)
	    // focal area (x, y, w, h)
	    // focal dimensions (w, h) optional
	    // TODO: focal point defaults to null or middle?
	    var fx = parseInt(img.attr("data-focal-x"));
	    var fy = parseInt(img.attr("data-focal-y"));
	    var fw = parseInt(img.attr("data-focal-width")) || 0;
	    var fh = parseInt(img.attr("data-focal-height")) || 0;
	    
	    // is there a better way to do this?
	    var r = this.fluimage("ratio");

	    // ensures integer
	    var scale = function(dim, ratio) {
		return Math.round(dim * ratio);
	    };

	    // always return focal itself
	    return {
		x: scale(fx, r),
		y: scale(fy, r),
		width: scale(fw, r),
		height: scale(fh, r),
		natural: {
		    x: fx,
		    y: fy,
		    width: fw,
		    height: fh
		}
	    };
	},

	//
	resize: function() {
	    
	    var image = this;

	    // TODO: classes or data attributes?
	    var contained = image.hasClass("contained");
	    var nofocal = image.hasClass("nofocal");
	    
	    // natural image width, height, ratio
	    var nw = image.naturalWidth();
	    var nh = image.naturalHeight();
	    var nr = nw / nh; // TODO: store this? it never changes

	    // parent of image node width, height, ratio
	    var pw = image.parent().width();
	    var ph = image.parent().height();
	    var pr = pw / ph;
	    
	    // http://en.wikipedia.org/wiki/Focal_point_(disambiguation)
	    // focal area (x, y, w, h)
	    // focal dimensions (w, h) optional
	    // focal point defaults to center of image
	    var fx = parseInt(image.attr("data-focal-x")) || nw / 2;
	    var fy = parseInt(image.attr("data-focal-y")) || nh / 2;
	    var fw = parseInt(image.attr("data-focal-width")) || 0;
	    var fh = parseInt(image.attr("data-focal-height")) || 0;

	    // scaled image (w, h)
	    var width, height;
	    
	    // "contained": natural ratio > parent ratio 
	    // "overflows": natual ratio < parent ratio
	    // != is equivalent to XOR 
	    if ((nr < pr) != contained) {
		width = pw;
		height = pw / nr;
	    } else {
		width = ph * nr;
		height = ph;
	    }            

	    // ratio of natural image to scaled
	    var scale = width / nw;

	    // midpoint of dilated focal area
	    var sx = (fx + fw / 2) * scale;
	    var sy = (fy + fh / 2) * scale;

	    var margin_left, margin_top;

	    // using "contained" or "nofocal" ignores focal area and centers image using midpoint
	    // else if the midpoint of focal area > midpoint of parent, then translate image without creating whitespace
	    if (contained || nofocal) { 
		margin_left = (pw - width) / 2;
		margin_top = (ph - height) / 2;
	    } else {
		margin_left = (sx > pw / 2) ? Math.max(pw / 2 - sx, pw - width) : 0;
		margin_top = (sy > ph / 2) ? Math.max(ph / 2 - sy, ph - height) : 0;
	    }

	    // set image
	    image.width(width);
	    image.height(height);
	    image.css("margin-left", margin_left);
	    image.css("margin-top", margin_top);

	    // TODO: return data schema
	    return {
		// focal relative to the viewport
		focal: {
		    x: fx * scale + margin_left,
		    y: fy * scale + margin_top,
		    width: fw * scale,
		    height: fh * scale
		}
	    };
	} // END resize()
	
    };

    // method caller
    $.fn.fluimage = function( method ) {    
	// method calling logic
	// http://docs.jquery.com/Plugins/Authoring
	if (methods[method]) {
	    return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if (typeof method === 'object' || ! method ) {
	    return methods.init.apply(this, arguments);
	} else {
	    $.error('Method ' +  method + ' does not exist on jQuery.fluimage');
	}    
    };

})(jQuery);
