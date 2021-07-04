/*
 Highcharts JS v6.1.2 (2018-08-31)

 (c) 2009-2016 Torstein Honsi

 License: www.highcharts.com/license
*/
(function (w) { "object" === typeof module && module.exports ? module.exports = w : "function" === typeof define && define.amd ? define(function () { return w }) : w(Highcharts) })(function (w) {
    (function (a) {
        function p(a, b) { this.init(a, b) } var v = a.CenteredSeriesMixin, u = a.each, q = a.extend, r = a.merge, h = a.splat; q(p.prototype, {
            coll: "pane", init: function (a, b) { this.chart = b; this.background = []; b.pane.push(this); this.setOptions(a) }, setOptions: function (a) { this.options = r(this.defaultOptions, this.chart.angular ? { background: {} } : void 0, a) }, render: function () {
                var a =
                    this.options, b = this.options.background, c = this.chart.renderer; this.group || (this.group = c.g("pane-group").attr({ zIndex: a.zIndex || 0 }).add()); this.updateCenter(); if (b) for (b = h(b), a = Math.max(b.length, this.background.length || 0), c = 0; c < a; c++)b[c] && this.axis ? this.renderBackground(r(this.defaultBackgroundOptions, b[c]), c) : this.background[c] && (this.background[c] = this.background[c].destroy(), this.background.splice(c, 1))
            }, renderBackground: function (a, b) {
                var c = "animate"; this.background[b] || (this.background[b] = this.chart.renderer.path().add(this.group),
                    c = "attr"); this.background[b][c]({ d: this.axis.getPlotBandPath(a.from, a.to, a) }).attr({ fill: a.backgroundColor, stroke: a.borderColor, "stroke-width": a.borderWidth, "class": "highcharts-pane " + (a.className || "") })
            }, defaultOptions: { center: ["50%", "50%"], size: "85%", startAngle: 0 }, defaultBackgroundOptions: { shape: "circle", borderWidth: 1, borderColor: "#cccccc", backgroundColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#ffffff"], [1, "#e6e6e6"]] }, from: -Number.MAX_VALUE, innerRadius: 0, to: Number.MAX_VALUE, outerRadius: "105%" },
            updateCenter: function (a) { this.center = (a || this.axis || {}).center = v.getCenter.call(this) }, update: function (a, b) { r(!0, this.options, a); this.setOptions(this.options); this.render(); u(this.chart.axes, function (c) { c.pane === this && (c.pane = null, c.update({}, b)) }, this) }
        }); a.Pane = p
    })(w); (function (a) {
        var p = a.addEvent, v = a.Axis, u = a.each, q = a.extend, r = a.map, h = a.merge, m = a.noop, b = a.pick, c = a.pInt, d = a.Tick, g = a.wrap, e = a.correctFloat, f, k, t = v.prototype, l = d.prototype; a.radialAxisExtended || (a.radialAxisExtended = !0, f = {
            getOffset: m,
            redraw: function () { this.isDirty = !1 }, render: function () { this.isDirty = !1 }, setScale: m, setCategories: m, setTitle: m
        }, k = {
            defaultRadialGaugeOptions: { labels: { align: "center", x: 0, y: null }, minorGridLineWidth: 0, minorTickInterval: "auto", minorTickLength: 10, minorTickPosition: "inside", minorTickWidth: 1, tickLength: 10, tickPosition: "inside", tickWidth: 2, title: { rotation: 0 }, zIndex: 2 }, defaultRadialXOptions: {
                gridLineWidth: 1, labels: { align: null, distance: 15, x: 0, y: null, style: { textOverflow: "none" } }, maxPadding: 0, minPadding: 0, showLastLabel: !1,
                tickLength: 0
            }, defaultRadialYOptions: { gridLineInterpolation: "circle", labels: { align: "right", x: -3, y: -2 }, showLastLabel: !1, title: { x: 4, text: null, rotation: 90 } }, setOptions: function (b) { b = this.options = h(this.defaultOptions, this.defaultRadialOptions, b); b.plotBands || (b.plotBands = []); a.fireEvent(this, "afterSetOptions") }, getOffset: function () { t.getOffset.call(this); this.chart.axisOffset[this.side] = 0 }, getLinePath: function (c, d) {
                c = this.center; var a = this.chart, e = b(d, c[2] / 2 - this.offset); this.isCircular || void 0 !== d ? (d =
                    this.chart.renderer.symbols.arc(this.left + c[0], this.top + c[1], e, e, { start: this.startAngleRad, end: this.endAngleRad, open: !0, innerR: 0 }), d.xBounds = [this.left + c[0]], d.yBounds = [this.top + c[1] - e]) : (d = this.postTranslate(this.angleRad, e), d = ["M", c[0] + a.plotLeft, c[1] + a.plotTop, "L", d.x, d.y]); return d
            }, setAxisTranslation: function () {
                t.setAxisTranslation.call(this); this.center && (this.transA = this.isCircular ? (this.endAngleRad - this.startAngleRad) / (this.max - this.min || 1) : this.center[2] / 2 / (this.max - this.min || 1), this.minPixelPadding =
                    this.isXAxis ? this.transA * this.minPointOffset : 0)
            }, beforeSetTickPositions: function () { if (this.autoConnect = this.isCircular && void 0 === b(this.userMax, this.options.max) && e(this.endAngleRad - this.startAngleRad) === e(2 * Math.PI)) this.max += this.categories && 1 || this.pointRange || this.closestPointRange || 0 }, setAxisSize: function () {
                t.setAxisSize.call(this); this.isRadial && (this.pane.updateCenter(this), this.isCircular && (this.sector = this.endAngleRad - this.startAngleRad), this.len = this.width = this.height = this.center[2] * b(this.sector,
                    1) / 2)
            }, getPosition: function (c, d) { return this.postTranslate(this.isCircular ? this.translate(c) : this.angleRad, b(this.isCircular ? d : this.translate(c), this.center[2] / 2) - this.offset) }, postTranslate: function (b, c) { var d = this.chart, e = this.center; b = this.startAngleRad + b; return { x: d.plotLeft + e[0] + Math.cos(b) * c, y: d.plotTop + e[1] + Math.sin(b) * c } }, getPlotBandPath: function (d, e, a) {
                var f = this.center, n = this.startAngleRad, g = f[2] / 2, k = [b(a.outerRadius, "100%"), a.innerRadius, b(a.thickness, 10)], l = Math.min(this.offset, 0), x = /%$/,
                t, B = this.isCircular; "polygon" === this.options.gridLineInterpolation ? f = this.getPlotLinePath(d).concat(this.getPlotLinePath(e, !0)) : (d = Math.max(d, this.min), e = Math.min(e, this.max), B || (k[0] = this.translate(d), k[1] = this.translate(e)), k = r(k, function (b) { x.test(b) && (b = c(b, 10) * g / 100); return b }), "circle" !== a.shape && B ? (d = n + this.translate(d), e = n + this.translate(e)) : (d = -Math.PI / 2, e = 1.5 * Math.PI, t = !0), k[0] -= l, k[2] -= l, f = this.chart.renderer.symbols.arc(this.left + f[0], this.top + f[1], k[0], k[0], {
                    start: Math.min(d, e), end: Math.max(d,
                        e), innerR: b(k[1], k[0] - k[2]), open: t
                })); return f
            }, getPlotLinePath: function (b, c) {
                var d = this, e = d.center, a = d.chart, f = d.getPosition(b), k, g, n; d.isCircular ? n = ["M", e[0] + a.plotLeft, e[1] + a.plotTop, "L", f.x, f.y] : "circle" === d.options.gridLineInterpolation ? (b = d.translate(b)) && (n = d.getLinePath(0, b)) : (u(a.xAxis, function (b) { b.pane === d.pane && (k = b) }), n = [], b = d.translate(b), e = k.tickPositions, k.autoConnect && (e = e.concat([e[0]])), c && (e = [].concat(e).reverse()), u(e, function (c, d) { g = k.getPosition(c, b); n.push(d ? "L" : "M", g.x, g.y) }));
                return n
            }, getTitlePosition: function () { var b = this.center, c = this.chart, d = this.options.title; return { x: c.plotLeft + b[0] + (d.x || 0), y: c.plotTop + b[1] - { high: .5, middle: .25, low: 0 }[d.align] * b[2] + (d.y || 0) } }
        }, p(v, "init", function (b) {
            var c = this.chart, d = c.angular, e = c.polar, a = this.isXAxis, g = d && a, l, n = c.options; b = b.userOptions.pane || 0; b = this.pane = c.pane && c.pane[b]; if (d) { if (q(this, g ? f : k), l = !a) this.defaultRadialOptions = this.defaultRadialGaugeOptions } else e && (q(this, k), this.defaultRadialOptions = (l = a) ? this.defaultRadialXOptions :
                h(this.defaultYAxisOptions, this.defaultRadialYOptions)); d || e ? (this.isRadial = !0, c.inverted = !1, n.chart.zoomType = null) : this.isRadial = !1; b && l && (b.axis = this); this.isCircular = l
        }), p(v, "afterInit", function () { var c = this.chart, d = this.options, e = this.pane, a = e && e.options; c.angular && this.isXAxis || !e || !c.angular && !c.polar || (this.angleRad = (d.angle || 0) * Math.PI / 180, this.startAngleRad = (a.startAngle - 90) * Math.PI / 180, this.endAngleRad = (b(a.endAngle, a.startAngle + 360) - 90) * Math.PI / 180, this.offset = d.offset || 0) }), g(t, "autoLabelAlign",
            function (b) { if (!this.isRadial) return b.apply(this, [].slice.call(arguments, 1)) }), p(d, "afterGetPosition", function (b) { this.axis.getPosition && q(b.pos, this.axis.getPosition(this.pos)) }), p(d, "afterGetLabelPosition", function (c) {
                var d = this.axis, e = this.label, a = d.options.labels, f = a.y, k, g = 20, l = a.align, n = (d.translate(this.pos) + d.startAngleRad + Math.PI / 2) / Math.PI * 180 % 360; d.isRadial && (k = d.getPosition(this.pos, d.center[2] / 2 + b(a.distance, -25)), "auto" === a.rotation ? e.attr({ rotation: n }) : null === f && (f = d.chart.renderer.fontMetrics(e.styles &&
                    e.styles.fontSize).b - e.getBBox().height / 2), null === l && (d.isCircular ? (this.label.getBBox().width > d.len * d.tickInterval / (d.max - d.min) && (g = 0), l = n > g && n < 180 - g ? "left" : n > 180 + g && n < 360 - g ? "right" : "center") : l = "center", e.attr({ align: l })), c.pos.x = k.x + a.x, c.pos.y = k.y + f)
            }), g(l, "getMarkPath", function (b, c, d, e, a, f, k) { var g = this.axis; g.isRadial ? (b = g.getPosition(this.pos, g.center[2] / 2 + e), c = ["M", c, d, "L", b.x, b.y]) : c = b.call(this, c, d, e, a, f, k); return c }))
    })(w); (function (a) {
        var p = a.each, v = a.pick, u = a.defined, q = a.seriesType, r =
            a.seriesTypes, h = a.Series.prototype, m = a.Point.prototype; q("arearange", "area", { lineWidth: 1, threshold: null, tooltip: { pointFormat: '\x3cspan style\x3d"color:{series.color}"\x3e\u25cf\x3c/span\x3e {series.name}: \x3cb\x3e{point.low}\x3c/b\x3e - \x3cb\x3e{point.high}\x3c/b\x3e\x3cbr/\x3e' }, trackByArea: !0, dataLabels: { align: null, verticalAlign: null, xLow: 0, xHigh: 0, yLow: 0, yHigh: 0 } }, {
                pointArrayMap: ["low", "high"], dataLabelCollections: ["dataLabel", "dataLabelUpper"], toYData: function (b) { return [b.low, b.high] }, pointValKey: "low",
                deferTranslatePolar: !0, highToXY: function (b) { var c = this.chart, d = this.xAxis.postTranslate(b.rectPlotX, this.yAxis.len - b.plotHigh); b.plotHighX = d.x - c.plotLeft; b.plotHigh = d.y - c.plotTop; b.plotLowX = b.plotX }, translate: function () {
                    var b = this, c = b.yAxis, d = !!b.modifyValue; r.area.prototype.translate.apply(b); p(b.points, function (a) { var e = a.low, f = a.high, k = a.plotY; null === f || null === e ? (a.isNull = !0, a.plotY = null) : (a.plotLow = k, a.plotHigh = c.translate(d ? b.modifyValue(f, a) : f, 0, 1, 0, 1), d && (a.yBottom = a.plotHigh)) }); this.chart.polar &&
                        p(this.points, function (c) { b.highToXY(c); c.tooltipPos = [(c.plotHighX + c.plotLowX) / 2, (c.plotHigh + c.plotLow) / 2] })
                }, getGraphPath: function (b) {
                    var c = [], d = [], a, e = r.area.prototype.getGraphPath, f, k, t; t = this.options; var l = this.chart.polar && !1 !== t.connectEnds, n = t.connectNulls, x = t.step; b = b || this.points; for (a = b.length; a--;)f = b[a], f.isNull || l || n || b[a + 1] && !b[a + 1].isNull || d.push({ plotX: f.plotX, plotY: f.plotY, doCurve: !1 }), k = {
                        polarPlotY: f.polarPlotY, rectPlotX: f.rectPlotX, yBottom: f.yBottom, plotX: v(f.plotHighX, f.plotX),
                        plotY: f.plotHigh, isNull: f.isNull
                    }, d.push(k), c.push(k), f.isNull || l || n || b[a - 1] && !b[a - 1].isNull || d.push({ plotX: f.plotX, plotY: f.plotY, doCurve: !1 }); b = e.call(this, b); x && (!0 === x && (x = "left"), t.step = { left: "right", center: "center", right: "left" }[x]); c = e.call(this, c); d = e.call(this, d); t.step = x; t = [].concat(b, c); this.chart.polar || "M" !== d[0] || (d[0] = "L"); this.graphPath = t; this.areaPath = b.concat(d); t.isArea = !0; t.xMap = b.xMap; this.areaPath.xMap = b.xMap; return t
                }, drawDataLabels: function () {
                    var b = this.data, c = b.length, d, a =
                        [], e = this.options.dataLabels, f = e.align, k = e.verticalAlign, t = e.inside, l, n, x = this.chart.inverted; if (e.enabled || this._hasPointLabels) {
                            for (d = c; d--;)if (l = b[d]) n = t ? l.plotHigh < l.plotLow : l.plotHigh > l.plotLow, l.y = l.high, l._plotY = l.plotY, l.plotY = l.plotHigh, a[d] = l.dataLabel, l.dataLabel = l.dataLabelUpper, l.below = n, x ? f || (e.align = n ? "right" : "left") : k || (e.verticalAlign = n ? "top" : "bottom"), e.x = e.xHigh, e.y = e.yHigh; h.drawDataLabels && h.drawDataLabels.apply(this, arguments); for (d = c; d--;)if (l = b[d]) n = t ? l.plotHigh < l.plotLow :
                                l.plotHigh > l.plotLow, l.dataLabelUpper = l.dataLabel, l.dataLabel = a[d], l.y = l.low, l.plotY = l._plotY, l.below = !n, x ? f || (e.align = n ? "left" : "right") : k || (e.verticalAlign = n ? "bottom" : "top"), e.x = e.xLow, e.y = e.yLow; h.drawDataLabels && h.drawDataLabels.apply(this, arguments)
                        } e.align = f; e.verticalAlign = k
                }, alignDataLabel: function () { r.column.prototype.alignDataLabel.apply(this, arguments) }, drawPoints: function () {
                    var b = this.points.length, c, d; h.drawPoints.apply(this, arguments); for (d = 0; d < b;)c = this.points[d], c.origProps = {
                        plotY: c.plotY,
                        plotX: c.plotX, isInside: c.isInside, negative: c.negative, zone: c.zone, y: c.y
                    }, c.lowerGraphic = c.graphic, c.graphic = c.upperGraphic, c.plotY = c.plotHigh, u(c.plotHighX) && (c.plotX = c.plotHighX), c.y = c.high, c.negative = c.high < (this.options.threshold || 0), c.zone = this.zones.length && c.getZone(), this.chart.polar || (c.isInside = c.isTopInside = void 0 !== c.plotY && 0 <= c.plotY && c.plotY <= this.yAxis.len && 0 <= c.plotX && c.plotX <= this.xAxis.len), d++; h.drawPoints.apply(this, arguments); for (d = 0; d < b;)c = this.points[d], c.upperGraphic = c.graphic,
                        c.graphic = c.lowerGraphic, a.extend(c, c.origProps), delete c.origProps, d++
                }, setStackedPoints: a.noop
            }, {
                setState: function () {
                    var b = this.state, c = this.series, d = c.chart.polar; u(this.plotHigh) || (this.plotHigh = c.yAxis.toPixels(this.high, !0)); u(this.plotLow) || (this.plotLow = this.plotY = c.yAxis.toPixels(this.low, !0)); c.stateMarkerGraphic && (c.lowerStateMarkerGraphic = c.stateMarkerGraphic, c.stateMarkerGraphic = c.upperStateMarkerGraphic); this.graphic = this.upperGraphic; this.plotY = this.plotHigh; d && (this.plotX = this.plotHighX);
                    m.setState.apply(this, arguments); this.state = b; this.plotY = this.plotLow; this.graphic = this.lowerGraphic; d && (this.plotX = this.plotLowX); c.stateMarkerGraphic && (c.upperStateMarkerGraphic = c.stateMarkerGraphic, c.stateMarkerGraphic = c.lowerStateMarkerGraphic, c.lowerStateMarkerGraphic = void 0); m.setState.apply(this, arguments)
                }, haloPath: function () {
                    var b = this.series.chart.polar, c = []; this.plotY = this.plotLow; b && (this.plotX = this.plotLowX); this.isInside && (c = m.haloPath.apply(this, arguments)); this.plotY = this.plotHigh;
                    b && (this.plotX = this.plotHighX); this.isTopInside && (c = c.concat(m.haloPath.apply(this, arguments))); return c
                }, destroyElements: function () { p(["lowerGraphic", "upperGraphic"], function (b) { this[b] && (this[b] = this[b].destroy()) }, this); this.graphic = null; return m.destroyElements.apply(this, arguments) }
                })
    })(w); (function (a) { var p = a.seriesType; p("areasplinerange", "arearange", null, { getPointSpline: a.seriesTypes.spline.prototype.getPointSpline }) })(w); (function (a) {
        var p = a.defaultPlotOptions, v = a.each, u = a.merge, q = a.noop,
        r = a.pick, h = a.seriesType, m = a.seriesTypes.column.prototype; h("columnrange", "arearange", u(p.column, p.arearange, { pointRange: null, marker: null, states: { hover: { halo: !1 } } }), {
            translate: function () {
                var b = this, c = b.yAxis, d = b.xAxis, a = d.startAngleRad, e, f = b.chart, k = b.xAxis.isRadial, t = Math.max(f.chartWidth, f.chartHeight) + 999, l; m.translate.apply(b); v(b.points, function (g) {
                    var n = g.shapeArgs, m = b.options.minPointLength, y, h; g.plotHigh = l = Math.min(Math.max(-t, c.translate(g.high, 0, 1, 0, 1)), t); g.plotLow = Math.min(Math.max(-t,
                        g.plotY), t); h = l; y = r(g.rectPlotY, g.plotY) - l; Math.abs(y) < m ? (m -= y, y += m, h -= m / 2) : 0 > y && (y *= -1, h -= y); k ? (e = g.barX + a, g.shapeType = "path", g.shapeArgs = { d: b.polarArc(h + y, h, e, e + g.pointWidth) }) : (n.height = y, n.y = h, g.tooltipPos = f.inverted ? [c.len + c.pos - f.plotLeft - h - y / 2, d.len + d.pos - f.plotTop - n.x - n.width / 2, y] : [d.left - f.plotLeft + n.x + n.width / 2, c.pos - f.plotTop + h + y / 2, y])
                })
            }, directTouch: !0, trackerGroups: ["group", "dataLabelsGroup"], drawGraph: q, getSymbol: q, crispCol: m.crispCol, drawPoints: m.drawPoints, drawTracker: m.drawTracker,
            getColumnMetrics: m.getColumnMetrics, pointAttribs: m.pointAttribs, animate: function () { return m.animate.apply(this, arguments) }, polarArc: function () { return m.polarArc.apply(this, arguments) }, translate3dPoints: function () { return m.translate3dPoints.apply(this, arguments) }, translate3dShapes: function () { return m.translate3dShapes.apply(this, arguments) }
        }, { setState: m.pointClass.prototype.setState })
    })(w); (function (a) {
        var p = a.each, v = a.isNumber, u = a.merge, q = a.pick, r = a.pInt, h = a.Series, m = a.seriesType, b = a.TrackerMixin;
        m("gauge", "line", { dataLabels: { enabled: !0, defer: !1, y: 15, borderRadius: 3, crop: !1, verticalAlign: "top", zIndex: 2, borderWidth: 1, borderColor: "#cccccc" }, dial: {}, pivot: {}, tooltip: { headerFormat: "" }, showInLegend: !1 }, {
            angular: !0, directTouch: !0, drawGraph: a.noop, fixedBox: !0, forceDL: !0, noSharedTooltip: !0, trackerGroups: ["group", "dataLabelsGroup"], translate: function () {
                var b = this.yAxis, d = this.options, a = b.center; this.generatePoints(); p(this.points, function (c) {
                    var e = u(d.dial, c.dial), k = r(q(e.radius, 80)) * a[2] / 200, g = r(q(e.baseLength,
                        70)) * k / 100, l = r(q(e.rearLength, 10)) * k / 100, n = e.baseWidth || 3, x = e.topWidth || 1, h = d.overshoot, m = b.startAngleRad + b.translate(c.y, null, null, null, !0); v(h) ? (h = h / 180 * Math.PI, m = Math.max(b.startAngleRad - h, Math.min(b.endAngleRad + h, m))) : !1 === d.wrap && (m = Math.max(b.startAngleRad, Math.min(b.endAngleRad, m))); m = 180 * m / Math.PI; c.shapeType = "path"; c.shapeArgs = { d: e.path || ["M", -l, -n / 2, "L", g, -n / 2, k, -x / 2, k, x / 2, g, n / 2, -l, n / 2, "z"], translateX: a[0], translateY: a[1], rotation: m }; c.plotX = a[0]; c.plotY = a[1]
                })
            }, drawPoints: function () {
                var b =
                    this, d = b.yAxis.center, a = b.pivot, e = b.options, f = e.pivot, k = b.chart.renderer; p(b.points, function (c) { var d = c.graphic, a = c.shapeArgs, f = a.d, g = u(e.dial, c.dial); d ? (d.animate(a), a.d = f) : (c.graphic = k[c.shapeType](a).attr({ rotation: a.rotation, zIndex: 1 }).addClass("highcharts-dial").add(b.group), c.graphic.attr({ stroke: g.borderColor || "none", "stroke-width": g.borderWidth || 0, fill: g.backgroundColor || "#000000" })) }); a ? a.animate({ translateX: d[0], translateY: d[1] }) : (b.pivot = k.circle(0, 0, q(f.radius, 5)).attr({ zIndex: 2 }).addClass("highcharts-pivot").translate(d[0],
                        d[1]).add(b.group), b.pivot.attr({ "stroke-width": f.borderWidth || 0, stroke: f.borderColor || "#cccccc", fill: f.backgroundColor || "#000000" }))
            }, animate: function (b) { var c = this; b || (p(c.points, function (b) { var a = b.graphic; a && (a.attr({ rotation: 180 * c.yAxis.startAngleRad / Math.PI }), a.animate({ rotation: b.shapeArgs.rotation }, c.options.animation)) }), c.animate = null) }, render: function () {
            this.group = this.plotGroup("group", "series", this.visible ? "visible" : "hidden", this.options.zIndex, this.chart.seriesGroup); h.prototype.render.call(this);
                this.group.clip(this.chart.clipRect)
            }, setData: function (b, a) { h.prototype.setData.call(this, b, !1); this.processData(); this.generatePoints(); q(a, !0) && this.chart.redraw() }, drawTracker: b && b.drawTrackerPoint
        }, { setState: function (b) { this.state = b } })
    })(w); (function (a) {
        var p = a.each, v = a.noop, u = a.pick, q = a.seriesType, r = a.seriesTypes; q("boxplot", "column", {
            threshold: null, tooltip: { pointFormat: '\x3cspan style\x3d"color:{point.color}"\x3e\u25cf\x3c/span\x3e \x3cb\x3e {series.name}\x3c/b\x3e\x3cbr/\x3eMaximum: {point.high}\x3cbr/\x3eUpper quartile: {point.q3}\x3cbr/\x3eMedian: {point.median}\x3cbr/\x3eLower quartile: {point.q1}\x3cbr/\x3eMinimum: {point.low}\x3cbr/\x3e' },
            whiskerLength: "50%", fillColor: "#ffffff", lineWidth: 1, medianWidth: 2, whiskerWidth: 2
        }, {
            pointArrayMap: ["low", "q1", "median", "q3", "high"], toYData: function (a) { return [a.low, a.q1, a.median, a.q3, a.high] }, pointValKey: "high", pointAttribs: function () { return {} }, drawDataLabels: v, translate: function () { var a = this.yAxis, m = this.pointArrayMap; r.column.prototype.translate.apply(this); p(this.points, function (b) { p(m, function (c) { null !== b[c] && (b[c + "Plot"] = a.translate(b[c], 0, 1, 0, 1)) }) }) }, drawPoints: function () {
                var a = this, m = a.options,
                b = a.chart.renderer, c, d, g, e, f, k, t = 0, l, n, x, r, q = !1 !== a.doQuartiles, v, z = a.options.whiskerLength; p(a.points, function (h) {
                    var p = h.graphic, y = p ? "animate" : "attr", B = h.shapeArgs, w = {}, D = {}, I = {}, J = {}, C = h.color || a.color; void 0 !== h.plotY && (l = B.width, n = Math.floor(B.x), x = n + l, r = Math.round(l / 2), c = Math.floor(q ? h.q1Plot : h.lowPlot), d = Math.floor(q ? h.q3Plot : h.lowPlot), g = Math.floor(h.highPlot), e = Math.floor(h.lowPlot), p || (h.graphic = p = b.g("point").add(a.group), h.stem = b.path().addClass("highcharts-boxplot-stem").add(p), z && (h.whiskers =
                        b.path().addClass("highcharts-boxplot-whisker").add(p)), q && (h.box = b.path(void 0).addClass("highcharts-boxplot-box").add(p)), h.medianShape = b.path(void 0).addClass("highcharts-boxplot-median").add(p)), D.stroke = h.stemColor || m.stemColor || C, D["stroke-width"] = u(h.stemWidth, m.stemWidth, m.lineWidth), D.dashstyle = h.stemDashStyle || m.stemDashStyle, h.stem.attr(D), z && (I.stroke = h.whiskerColor || m.whiskerColor || C, I["stroke-width"] = u(h.whiskerWidth, m.whiskerWidth, m.lineWidth), h.whiskers.attr(I)), q && (w.fill = h.fillColor ||
                            m.fillColor || C, w.stroke = m.lineColor || C, w["stroke-width"] = m.lineWidth || 0, h.box.attr(w)), J.stroke = h.medianColor || m.medianColor || C, J["stroke-width"] = u(h.medianWidth, m.medianWidth, m.lineWidth), h.medianShape.attr(J), k = h.stem.strokeWidth() % 2 / 2, t = n + r + k, h.stem[y]({ d: ["M", t, d, "L", t, g, "M", t, c, "L", t, e] }), q && (k = h.box.strokeWidth() % 2 / 2, c = Math.floor(c) + k, d = Math.floor(d) + k, n += k, x += k, h.box[y]({ d: ["M", n, d, "L", n, c, "L", x, c, "L", x, d, "L", n, d, "z"] })), z && (k = h.whiskers.strokeWidth() % 2 / 2, g += k, e += k, v = /%$/.test(z) ? r * parseFloat(z) /
                                100 : z / 2, h.whiskers[y]({ d: ["M", t - v, g, "L", t + v, g, "M", t - v, e, "L", t + v, e] })), f = Math.round(h.medianPlot), k = h.medianShape.strokeWidth() % 2 / 2, f += k, h.medianShape[y]({ d: ["M", n, f, "L", x, f] }))
                })
            }, setStackedPoints: v
            })
    })(w); (function (a) {
        var p = a.each, v = a.noop, u = a.seriesType, q = a.seriesTypes; u("errorbar", "boxplot", {
            color: "#000000", grouping: !1, linkedTo: ":previous", tooltip: { pointFormat: '\x3cspan style\x3d"color:{point.color}"\x3e\u25cf\x3c/span\x3e {series.name}: \x3cb\x3e{point.low}\x3c/b\x3e - \x3cb\x3e{point.high}\x3c/b\x3e\x3cbr/\x3e' },
            whiskerWidth: null
        }, { type: "errorbar", pointArrayMap: ["low", "high"], toYData: function (a) { return [a.low, a.high] }, pointValKey: "high", doQuartiles: !1, drawDataLabels: q.arearange ? function () { var a = this.pointValKey; q.arearange.prototype.drawDataLabels.call(this); p(this.data, function (h) { h.y = h[a] }) } : v, getColumnMetrics: function () { return this.linkedParent && this.linkedParent.columnMetrics || q.column.prototype.getColumnMetrics.call(this) } })
    })(w); (function (a) {
        var p = a.correctFloat, v = a.isNumber, u = a.pick, q = a.Point, r = a.Series,
        h = a.seriesType, m = a.seriesTypes; h("waterfall", "column", { dataLabels: { inside: !0 }, lineWidth: 1, lineColor: "#333333", dashStyle: "dot", borderColor: "#333333", states: { hover: { lineWidthPlus: 0 } } }, {
            pointValKey: "y", showLine: !0, generatePoints: function () { var b = this.options.threshold, c, a, g, e; m.column.prototype.generatePoints.apply(this); g = 0; for (a = this.points.length; g < a; g++)c = this.points[g], e = this.processedYData[g], c.isSum ? c.y = p(e) : c.isIntermediateSum && (c.y = p(e - b), b = e) }, translate: function () {
                var b = this.options, c = this.yAxis,
                a, g, e, f, k, t, l, n, h, q, p = u(b.minPointLength, 5), r = p / 2, v = b.threshold, w = b.stacking, A; m.column.prototype.translate.apply(this); n = h = v; g = this.points; a = 0; for (b = g.length; a < b; a++)e = g[a], l = this.processedYData[a], f = e.shapeArgs, k = w && c.stacks[(this.negStacks && l < v ? "-" : "") + this.stackKey], A = this.getStackIndicator(A, e.x, this.index), q = u(k && k[e.x].points[A.key], [0, l]), t = Math.max(n, n + e.y) + q[0], f.y = c.translate(t, 0, 1, 0, 1), e.isSum ? (f.y = c.translate(q[1], 0, 1, 0, 1), f.height = Math.min(c.translate(q[0], 0, 1, 0, 1), c.len) - f.y) : e.isIntermediateSum ?
                    (f.y = c.translate(q[1], 0, 1, 0, 1), f.height = Math.min(c.translate(h, 0, 1, 0, 1), c.len) - f.y, h = q[1]) : (f.height = 0 < l ? c.translate(n, 0, 1, 0, 1) - f.y : c.translate(n, 0, 1, 0, 1) - c.translate(n - l, 0, 1, 0, 1), n += k && k[e.x] ? k[e.x].total : l, e.below = n < u(v, 0)), 0 > f.height && (f.y += f.height, f.height *= -1), e.plotY = f.y = Math.round(f.y) - this.borderWidth % 2 / 2, f.height = Math.max(Math.round(f.height), .001), e.yBottom = f.y + f.height, f.height <= p && !e.isNull ? (f.height = p, f.y -= r, e.plotY = f.y, e.minPointLengthOffset = 0 > e.y ? -r : r) : (e.isNull && (f.width = 0), e.minPointLengthOffset =
                        0), f = e.plotY + (e.negative ? f.height : 0), this.chart.inverted ? e.tooltipPos[0] = c.len - f : e.tooltipPos[1] = f
            }, processData: function (b) { var c = this.yData, a = this.options.data, g, e = c.length, f, k, t, l, n, h; k = f = t = l = this.options.threshold || 0; for (h = 0; h < e; h++)n = c[h], g = a && a[h] ? a[h] : {}, "sum" === n || g.isSum ? c[h] = p(k) : "intermediateSum" === n || g.isIntermediateSum ? c[h] = p(f) : (k += n, f += n), t = Math.min(k, t), l = Math.max(k, l); r.prototype.processData.call(this, b); this.options.stacking || (this.dataMin = t, this.dataMax = l) }, toYData: function (b) {
                return b.isSum ?
                    0 === b.x ? null : "sum" : b.isIntermediateSum ? 0 === b.x ? null : "intermediateSum" : b.y
            }, pointAttribs: function (b, c) { var a = this.options.upColor; a && !b.options.color && (b.color = 0 < b.y ? a : null); b = m.column.prototype.pointAttribs.call(this, b, c); delete b.dashstyle; return b }, getGraphPath: function () { return ["M", 0, 0] }, getCrispPath: function () {
                var b = this.data, c = b.length, a = this.graph.strokeWidth() + this.borderWidth, a = Math.round(a) % 2 / 2, g = this.xAxis.reversed, e = this.yAxis.reversed, f = [], k, h, l; for (l = 1; l < c; l++) {
                    h = b[l].shapeArgs; k = b[l -
                        1].shapeArgs; h = ["M", k.x + (g ? 0 : k.width), k.y + b[l - 1].minPointLengthOffset + a, "L", h.x + (g ? k.width : 0), k.y + b[l - 1].minPointLengthOffset + a]; if (0 > b[l - 1].y && !e || 0 < b[l - 1].y && e) h[2] += k.height, h[5] += k.height; f = f.concat(h)
                } return f
            }, drawGraph: function () { r.prototype.drawGraph.call(this); this.graph.attr({ d: this.getCrispPath() }) }, setStackedPoints: function () {
                var b = this.options, c, a; r.prototype.setStackedPoints.apply(this, arguments); c = this.stackedYData ? this.stackedYData.length : 0; for (a = 1; a < c; a++)b.data[a].isSum || b.data[a].isIntermediateSum ||
                    (this.stackedYData[a] += this.stackedYData[a - 1])
            }, getExtremes: function () { if (this.options.stacking) return r.prototype.getExtremes.apply(this, arguments) }
        }, { getClassName: function () { var b = q.prototype.getClassName.call(this); this.isSum ? b += " highcharts-sum" : this.isIntermediateSum && (b += " highcharts-intermediate-sum"); return b }, isValid: function () { return v(this.y, !0) || this.isSum || this.isIntermediateSum } })
    })(w); (function (a) {
        var p = a.Series, v = a.seriesType, u = a.seriesTypes; v("polygon", "scatter", {
            marker: {
                enabled: !1,
                states: { hover: { enabled: !1 } }
            }, stickyTracking: !1, tooltip: { followPointer: !0, pointFormat: "" }, trackByArea: !0
        }, { type: "polygon", getGraphPath: function () { for (var a = p.prototype.getGraphPath.call(this), r = a.length + 1; r--;)(r === a.length || "M" === a[r]) && 0 < r && a.splice(r, 0, "z"); return this.areaPath = a }, drawGraph: function () { this.options.fillColor = this.color; u.area.prototype.drawGraph.call(this) }, drawLegendSymbol: a.LegendSymbolMixin.drawRectangle, drawTracker: p.prototype.drawTracker, setStackedPoints: a.noop })
    })(w); (function (a) {
        var p =
            a.arrayMax, v = a.arrayMin, u = a.Axis, q = a.color, r = a.each, h = a.isNumber, m = a.noop, b = a.pick, c = a.pInt, d = a.Point, g = a.Series, e = a.seriesType, f = a.seriesTypes; e("bubble", "scatter", {
                dataLabels: { formatter: function () { return this.point.z }, inside: !0, verticalAlign: "middle" }, animationLimit: 250, marker: { lineColor: null, lineWidth: 1, fillOpacity: .5, radius: null, states: { hover: { radiusPlus: 0 } }, symbol: "circle" }, minSize: 8, maxSize: "20%", softThreshold: !1, states: { hover: { halo: { size: 5 } } }, tooltip: { pointFormat: "({point.x}, {point.y}), Size: {point.z}" },
                turboThreshold: 0, zThreshold: 0, zoneAxis: "z"
            }, {
                pointArrayMap: ["y", "z"], parallelArrays: ["x", "y", "z"], trackerGroups: ["group", "dataLabelsGroup"], specialGroup: "group", bubblePadding: !0, zoneAxis: "z", directTouch: !0, pointAttribs: function (b, a) { var c = this.options.marker.fillOpacity; b = g.prototype.pointAttribs.call(this, b, a); 1 !== c && (b.fill = q(b.fill).setOpacity(c).get("rgba")); return b }, getRadii: function (b, a, c, e) {
                    var d, f, k, g = this.zData, l = [], n = this.options, t = "width" !== n.sizeBy, m = n.zThreshold, p = a - b; f = 0; for (d = g.length; f <
                        d; f++)k = g[f], n.sizeByAbsoluteValue && null !== k && (k = Math.abs(k - m), a = p = Math.max(a - m, Math.abs(b - m)), b = 0), h(k) ? k < b ? k = c / 2 - 1 : (k = 0 < p ? (k - b) / p : .5, t && 0 <= k && (k = Math.sqrt(k)), k = Math.ceil(c + k * (e - c)) / 2) : k = null, l.push(k); this.radii = l
                }, animate: function (b) { !b && this.points.length < this.options.animationLimit && (r(this.points, function (b) { var a = b.graphic, c; a && a.width && (c = { x: a.x, y: a.y, width: a.width, height: a.height }, a.attr({ x: b.plotX, y: b.plotY, width: 1, height: 1 }), a.animate(c, this.options.animation)) }, this), this.animate = null) },
                    translate: function () { var b, c = this.data, e, d, g = this.radii; f.scatter.prototype.translate.call(this); for (b = c.length; b--;)e = c[b], d = g ? g[b] : 0, h(d) && d >= this.minPxSize / 2 ? (e.marker = a.extend(e.marker, { radius: d, width: 2 * d, height: 2 * d }), e.dlBox = { x: e.plotX - d, y: e.plotY - d, width: 2 * d, height: 2 * d }) : e.shapeArgs = e.plotY = e.dlBox = void 0 }, alignDataLabel: f.column.prototype.alignDataLabel, buildKDTree: m, applyZones: m
                }, {
                    haloPath: function (b) { return d.prototype.haloPath.call(this, 0 === b ? 0 : (this.marker ? this.marker.radius || 0 : 0) + b) },
                    ttBelow: !1
                }); u.prototype.beforePadding = function () {
                    var e = this, d = this.len, f = this.chart, g = 0, m = d, q = this.isXAxis, u = q ? "xData" : "yData", w = this.min, z = {}, K = Math.min(f.plotWidth, f.plotHeight), A = Number.MAX_VALUE, F = -Number.MAX_VALUE, G = this.max - w, E = d / G, H = []; r(this.series, function (d) {
                        var g = d.options; !d.bubblePadding || !d.visible && f.options.chart.ignoreHiddenSeries || (e.allowZoomOutside = !0, H.push(d), q && (r(["minSize", "maxSize"], function (b) { var a = g[b], d = /%$/.test(a), a = c(a); z[b] = d ? K * a / 100 : a }), d.minPxSize = z.minSize, d.maxPxSize =
                            Math.max(z.maxSize, z.minSize), d = a.grep(d.zData, a.isNumber), d.length && (A = b(g.zMin, Math.min(A, Math.max(v(d), !1 === g.displayNegative ? g.zThreshold : -Number.MAX_VALUE))), F = b(g.zMax, Math.max(F, p(d))))))
                    }); r(H, function (b) { var a = b[u], c = a.length, d; q && b.getRadii(A, F, b.minPxSize, b.maxPxSize); if (0 < G) for (; c--;)h(a[c]) && e.dataMin <= a[c] && a[c] <= e.dataMax && (d = b.radii[c], g = Math.min((a[c] - w) * E - d, g), m = Math.max((a[c] - w) * E + d, m)) }); H.length && 0 < G && !this.isLog && (m -= d, E *= (d + g - m) / d, r([["min", "userMin", g], ["max", "userMax", m]],
                        function (a) { void 0 === b(e.options[a[0]], e[a[1]]) && (e[a[0]] += a[2] / E) }))
                }
    })(w); (function (a) {
        var p = a.each, v = a.pick, u = a.Series, q = a.seriesTypes, r = a.wrap, h = u.prototype, m = a.Pointer.prototype; a.polarExtended || (a.polarExtended = !0, h.searchPointByAngle = function (b) { var a = this.chart, d = this.xAxis.pane.center; return this.searchKDTree({ clientX: 180 + -180 / Math.PI * Math.atan2(b.chartX - d[0] - a.plotLeft, b.chartY - d[1] - a.plotTop) }) }, h.getConnectors = function (b, a, d, g) {
            var c, f, k, h, l, n, m, p; f = g ? 1 : 0; c = 0 <= a && a <= b.length - 1 ? a : 0 > a ? b.length -
                1 + a : 0; a = 0 > c - 1 ? b.length - (1 + f) : c - 1; f = c + 1 > b.length - 1 ? f : c + 1; k = b[a]; f = b[f]; h = k.plotX; k = k.plotY; l = f.plotX; n = f.plotY; f = b[c].plotX; c = b[c].plotY; h = (1.5 * f + h) / 2.5; k = (1.5 * c + k) / 2.5; l = (1.5 * f + l) / 2.5; m = (1.5 * c + n) / 2.5; n = Math.sqrt(Math.pow(h - f, 2) + Math.pow(k - c, 2)); p = Math.sqrt(Math.pow(l - f, 2) + Math.pow(m - c, 2)); h = Math.atan2(k - c, h - f); m = Math.PI / 2 + (h + Math.atan2(m - c, l - f)) / 2; Math.abs(h - m) > Math.PI / 2 && (m -= Math.PI); h = f + Math.cos(m) * n; k = c + Math.sin(m) * n; l = f + Math.cos(Math.PI + m) * p; m = c + Math.sin(Math.PI + m) * p; f = {
                    rightContX: l, rightContY: m,
                    leftContX: h, leftContY: k, plotX: f, plotY: c
                }; d && (f.prevPointCont = this.getConnectors(b, a, !1, g)); return f
        }, r(h, "buildKDTree", function (b) { this.chart.polar && (this.kdByAngle ? this.searchPoint = this.searchPointByAngle : this.options.findNearestPointBy = "xy"); b.apply(this) }), h.toXY = function (b) {
            var a, d = this.chart, g = b.plotX; a = b.plotY; b.rectPlotX = g; b.rectPlotY = a; a = this.xAxis.postTranslate(b.plotX, this.yAxis.len - a); b.plotX = b.polarPlotX = a.x - d.plotLeft; b.plotY = b.polarPlotY = a.y - d.plotTop; this.kdByAngle ? (d = (g / Math.PI * 180 +
                this.xAxis.pane.options.startAngle) % 360, 0 > d && (d += 360), b.clientX = d) : b.clientX = b.plotX
        }, q.spline && (r(q.spline.prototype, "getPointSpline", function (b, a, d, g) { this.chart.polar ? g ? (b = this.getConnectors(a, g, !0, this.connectEnds), b = ["C", b.prevPointCont.rightContX, b.prevPointCont.rightContY, b.leftContX, b.leftContY, b.plotX, b.plotY]) : b = ["M", d.plotX, d.plotY] : b = b.call(this, a, d, g); return b }), q.areasplinerange && (q.areasplinerange.prototype.getPointSpline = q.spline.prototype.getPointSpline)), a.addEvent(u, "afterTranslate",
            function () { var b = this.chart, c, d; if (b.polar) { this.kdByAngle = b.tooltip && b.tooltip.shared; if (!this.preventPostTranslate) for (c = this.points, d = c.length; d--;)this.toXY(c[d]); this.hasClipCircleSetter || (this.hasClipCircleSetter = !!a.addEvent(this, "afterRender", function () { var c; b.polar && (c = this.yAxis.center, this.group.clip(b.renderer.clipCircle(c[0], c[1], c[2] / 2)), this.setClip = a.noop) })) } }, { order: 2 }), r(h, "getGraphPath", function (b, a) {
                var c = this, g, e, f; if (this.chart.polar) {
                    a = a || this.points; for (g = 0; g < a.length; g++)if (!a[g].isNull) {
                        e =
                        g; break
                    } !1 !== this.options.connectEnds && void 0 !== e && (this.connectEnds = !0, a.splice(a.length, 0, a[e]), f = !0); p(a, function (b) { void 0 === b.polarPlotY && c.toXY(b) })
                } g = b.apply(this, [].slice.call(arguments, 1)); f && a.pop(); return g
            }), u = function (b, a) {
                var c = this.chart, g = this.options.animation, e = this.group, f = this.markerGroup, k = this.xAxis.center, h = c.plotLeft, l = c.plotTop; c.polar ? c.renderer.isSVG && (!0 === g && (g = {}), a ? (b = { translateX: k[0] + h, translateY: k[1] + l, scaleX: .001, scaleY: .001 }, e.attr(b), f && f.attr(b)) : (b = {
                    translateX: h,
                    translateY: l, scaleX: 1, scaleY: 1
                }, e.animate(b, g), f && f.animate(b, g), this.animate = null)) : b.call(this, a)
            }, r(h, "animate", u), q.column && (q = q.column.prototype, q.polarArc = function (b, a, d, g) { var c = this.xAxis.center, f = this.yAxis.len; return this.chart.renderer.symbols.arc(c[0], c[1], f - a, null, { start: d, end: g, innerR: f - v(b, f) }) }, r(q, "animate", u), r(q, "translate", function (b) {
                var a = this.xAxis, d = a.startAngleRad, g, e, f; this.preventPostTranslate = !0; b.call(this); if (a.isRadial) for (g = this.points, f = g.length; f--;)e = g[f], b = e.barX +
                    d, e.shapeType = "path", e.shapeArgs = { d: this.polarArc(e.yBottom, e.plotY, b, b + e.pointWidth) }, this.toXY(e), e.tooltipPos = [e.plotX, e.plotY], e.ttBelow = e.plotY > a.center[1]
            }), r(q, "alignDataLabel", function (a, c, d, g, e, f) { this.chart.polar ? (a = c.rectPlotX / Math.PI * 180, null === g.align && (g.align = 20 < a && 160 > a ? "left" : 200 < a && 340 > a ? "right" : "center"), null === g.verticalAlign && (g.verticalAlign = 45 > a || 315 < a ? "bottom" : 135 < a && 225 > a ? "top" : "middle"), h.alignDataLabel.call(this, c, d, g, e, f)) : a.call(this, c, d, g, e, f) })), r(m, "getCoordinates",
                function (a, c) { var b = this.chart, g = { xAxis: [], yAxis: [] }; b.polar ? p(b.axes, function (a) { var d = a.isXAxis, e = a.center, h = c.chartX - e[0] - b.plotLeft, e = c.chartY - e[1] - b.plotTop; g[d ? "xAxis" : "yAxis"].push({ axis: a, value: a.translate(d ? Math.PI - Math.atan2(h, e) : Math.sqrt(Math.pow(h, 2) + Math.pow(e, 2)), !0) }) }) : g = a.call(this, c); return g }), a.SVGRenderer.prototype.clipCircle = function (b, c, d) { var g = a.uniqueKey(), e = this.createElement("clipPath").attr({ id: g }).add(this.defs); b = this.circle(b, c, d).add(e); b.id = g; b.clipPath = e; return b },
            a.addEvent(a.Chart, "getAxes", function () { this.pane || (this.pane = []); p(a.splat(this.options.pane), function (b) { new a.Pane(b, this) }, this) }), a.addEvent(a.Chart, "afterDrawChartBox", function () { p(this.pane, function (a) { a.render() }) }), r(a.Chart.prototype, "get", function (b, c) { return a.find(this.pane, function (a) { return a.options.id === c }) || b.call(this, c) }))
    })(w)
});
