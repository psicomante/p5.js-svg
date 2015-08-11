var SVGCanvas = require('svgcanvas');

module.exports = function(p5) {
    function RendererSVG(elt, pInst, isMainCanvas) {
        var svgCanvas = new SVGCanvas();
        var svg = svgCanvas.svg;

        // replace <canvas> with <svg> and copy id, className
        var parent = elt.parentNode;
        var id = elt.id;
        var className = elt.className;
        parent.replaceChild(svgCanvas.getElement(), elt);
        svgCanvas.id = id;
        svgCanvas.className = className;
        elt = svgCanvas; // our fake <canvas>

        elt.parentNode = {
            // fake parentNode.removeChild so that noCanvas will work
            removeChild: function(element) {
                if (element === elt) {
                    var wrapper = svgCanvas.getElement();
                    wrapper.parentNode.removeChild(wrapper);
                }
            }
        };

        p5.Renderer2D.call(this, elt, pInst, isMainCanvas);

        this.isSVG = true;
        this.svg = svg;

        return this;
    }

    RendererSVG.prototype = Object.create(p5.Renderer2D.prototype);

    RendererSVG.prototype._applyDefaults = function() {
        p5.Renderer2D.prototype._applyDefaults.call(this);
        this.drawingContext.lineWidth = 1;
    };

    RendererSVG.prototype.resize = function(w, h) {
        if (!w || !h) {
            // ignore invalid values for width and height
            return;
        }
        if (this.width !== w || this.height !== h) {
            // canvas will be cleared if its size changed
            // so, we do same thing for SVG
            // note that at first this.width and this.height is undefined
            // so, also check that
            if (this.width && this.height) {
                this.drawingContext.clearRect(0, 0, this.width, this.height);
            }
        }
        this._withPixelDensity(function() {
            p5.Renderer2D.prototype.resize.call(this, w, h);
        });
        // For scale, crop
        // see also: http://sarasoueidan.com/blog/svg-coordinate-systems/
        this.svg.setAttribute("viewBox", [0, 0, w, h].join(' '));
    };

    RendererSVG.prototype._withPixelDensity = function(fn) {
        var pixelDensity = this._pInst.pixelDensity;
        this._pInst.pixelDensity = 1; // 1 is OK for SVG
        fn.apply(this);
        this._pInst.pixelDensity = pixelDensity;
    };

    RendererSVG.prototype.background = function() {
        var args = arguments;
        this._withPixelDensity(function() {
            p5.Renderer2D.prototype.background.apply(this, args);
        });
    };

    RendererSVG.prototype.resetMatrix = function() {
        this._withPixelDensity(function() {
            p5.Renderer2D.prototype.resetMatrix.apply(this);
        });
    };

    // set gc flag for svgcanvas
    RendererSVG.prototype._setGCFlag = function(element) {
        var that = this.drawingContext;
        var currentGeneration = that.generations[that.generations.length - 1];
        currentGeneration.push(element);
    };

    RendererSVG.prototype.appendChild = function(element) {
        this._setGCFlag(element);
        this.drawingContext.__closestGroupOrSvg().appendChild(element);
    };

    RendererSVG.prototype.image = function(img, x, y, w, h) {
        var elt = img._graphics && img._graphics.svg;
        elt = elt || (img.nodeName && (img.nodeName.toLowerCase() == "svg") && img);
        if (elt) {
            // it's <svg> element, let's handle it
            elt = elt.cloneNode(true);
            elt.setAttribute("width", w);
            elt.setAttribute("height", h);
            elt.setAttribute("x", x);
            elt.setAttribute("y", y);
            this.appendChild(elt);
        } else {
            p5.Renderer2D.prototype.image.apply(this, arguments);
        }
    };

    p5.RendererSVG = RendererSVG;
};