(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ImageModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/js/index.js":[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var templates = require("./templates");
var DocUtils = require("docxtemplater").DocUtils;
var DOMParser = require("xmldom").DOMParser;

function isNaN(number) {
	return !(number === number);
}

var ImgManager = require("./imgManager");
var moduleName = "open-xml-templating/docxtemplater-image-module";

function getInnerDocx(_ref) {
	var part = _ref.part;

	return part;
}

function getInnerPptx(_ref2) {
	var part = _ref2.part,
	    left = _ref2.left,
	    right = _ref2.right,
	    postparsed = _ref2.postparsed;

	var xmlString = postparsed.slice(left + 1, right).reduce(function (concat, item) {
		return concat + item.value;
	}, "");
	var xmlDoc = new DOMParser().parseFromString("<xml>" + xmlString + "</xml>");
	part.offset = { x: 0, y: 0 };
	part.ext = { cx: 0, cy: 0 };
	var offset = xmlDoc.getElementsByTagName("a:off");
	var ext = xmlDoc.getElementsByTagName("a:ext");
	if (ext.length > 0) {
		part.ext.cx = parseInt(ext[ext.length - 1].getAttribute("cx"), 10);
		part.ext.cy = parseInt(ext[ext.length - 1].getAttribute("cy"), 10);
	}
	if (offset.length > 0) {
		part.offset.x = parseInt(offset[offset.length - 1].getAttribute("x"), 10);
		part.offset.y = parseInt(offset[offset.length - 1].getAttribute("y"), 10);
	}
	return part;
}

var ImageModule = function () {
	function ImageModule(options) {
		_classCallCheck(this, ImageModule);

		this.name = "ImageModule";
		this.options = options || {};
		this.imgManagers = {};
		if (this.options.centered == null) {
			this.options.centered = false;
		}
		if (this.options.getImage == null) {
			throw new Error("You should pass getImage");
		}
		if (this.options.getSize == null) {
			throw new Error("You should pass getSize");
		}
		this.imageNumber = 1;
	}

	_createClass(ImageModule, [{
		key: "optionsTransformer",
		value: function optionsTransformer(options, docxtemplater) {
			var relsFiles = docxtemplater.zip.file(/\.xml\.rels/).concat(docxtemplater.zip.file(/\[Content_Types\].xml/)).map(function (file) {
				return file.name;
			});
			this.fileTypeConfig = docxtemplater.fileTypeConfig;
			this.fileType = docxtemplater.fileType;
			this.zip = docxtemplater.zip;
			options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
			return options;
		}
	}, {
		key: "set",
		value: function set(options) {
			if (options.zip) {
				this.zip = options.zip;
			}
			if (options.xmlDocuments) {
				this.xmlDocuments = options.xmlDocuments;
			}
		}
	}, {
		key: "parse",
		value: function parse(placeHolderContent) {
			var module = moduleName;
			var type = "placeholder";
			if (this.options.setParser) {
				return this.options.setParser(placeHolderContent);
			}
			if (placeHolderContent.substring(0, 2) === "%%") {
				return { type: type, value: placeHolderContent.substr(2), module: module, centered: true };
			}
			if (placeHolderContent.substring(0, 1) === "%") {
				return { type: type, value: placeHolderContent.substr(1), module: module, centered: false };
			}
			return null;
		}
	}, {
		key: "postparse",
		value: function postparse(parsed) {
			var expandTo = void 0;
			var getInner = void 0;
			if (this.fileType === "pptx") {
				expandTo = "p:sp";
				getInner = getInnerPptx;
			} else {
				expandTo = this.options.centered ? "w:p" : "w:t";
				getInner = getInnerDocx;
			}
			return DocUtils.traits.expandToOne(parsed, { moduleName: moduleName, getInner: getInner, expandTo: expandTo });
		}
	}, {
		key: "render",
		value: function render(part, options) {
			if (!part.type === "placeholder" || part.module !== moduleName) {
				return null;
			}
			var tagValue = options.scopeManager.getValue(part.value, {
				part: part
			});
			if (!tagValue) {
				return { value: this.fileTypeConfig.tagTextXml };
			} else if ((typeof tagValue === "undefined" ? "undefined" : _typeof(tagValue)) === "object") {
				return this.getRenderedPart(part, tagValue.rId, tagValue.sizePixel);
			}
			// this.imgManagers[options.filePath] = this.imgManagers[options.filePath] || new ImgManager(this.zip, options.filePath, this.xmlDocuments, this.fileType);
			var imgManager = new ImgManager(this.zip, options.filePath, this.xmlDocuments, this.fileType);
			var imgBuffer = this.options.getImage(tagValue, part.value);
			var rId = imgManager.addImageRels(this.getNextImageName(), imgBuffer);
			var sizePixel = this.options.getSize(imgBuffer, tagValue, part.value);
			return this.getRenderedPart(part, rId, sizePixel);
		}
	}, {
		key: "resolve",
		value: function resolve(part, options) {
			var _this = this;

			// this.imgManagers[options.filePath] = this.imgManagers[options.filePath] || new ImgManager(this.zip, options.filePath, this.xmlDocuments, this.fileType);
			var imgManager = new ImgManager(this.zip, options.filePath, this.xmlDocuments, this.fileType);
			if (!part.type === "placeholder" || part.module !== moduleName) {
				return null;
			}
			var value = options.scopeManager.getValue(part.value, {
				part: part
			});
			if (!value) {
				return { value: this.fileTypeConfig.tagTextXml };
			}
			return new Promise(function (resolve) {
				var imgBuffer = _this.options.getImage(value, part.value);
				resolve(imgBuffer);
			}).then(function (imgBuffer) {
				var rId = imgManager.addImageRels(_this.getNextImageName(), imgBuffer);
				return new Promise(function (resolve) {
					var sizePixel = _this.options.getSize(imgBuffer, value, part.value);
					resolve(sizePixel);
				}).then(function (sizePixel) {
					return {
						rId: rId,
						sizePixel: sizePixel
					};
				});
			});
		}
	}, {
		key: "getRenderedPart",
		value: function getRenderedPart(part, rId, sizePixel) {
			if (isNaN(rId)) {
				throw new Error("rId is NaN, aborting");
			}
			var size = [DocUtils.convertPixelsToEmus(sizePixel[0]), DocUtils.convertPixelsToEmus(sizePixel[1])];
			var centered = this.options.centered || part.centered;
			var newText = void 0;
			if (this.fileType === "pptx") {
				newText = this.getRenderedPartPptx(part, rId, size, centered);
			} else {
				newText = this.getRenderedPartDocx(rId, size, centered);
			}
			return { value: newText };
		}
	}, {
		key: "getRenderedPartPptx",
		value: function getRenderedPartPptx(part, rId, size, centered) {
			var offset = { x: parseInt(part.offset.x, 10), y: parseInt(part.offset.y, 10) };
			var cellCX = parseInt(part.ext.cx, 10) || 1;
			var cellCY = parseInt(part.ext.cy, 10) || 1;
			var imgW = parseInt(size[0], 10) || 1;
			var imgH = parseInt(size[1], 10) || 1;
			if (centered) {
				offset.x = Math.round(offset.x + cellCX / 2 - imgW / 2);
				offset.y = Math.round(offset.y + cellCY / 2 - imgH / 2);
			}
			return templates.getPptxImageXml(rId, [imgW, imgH], offset);
		}
	}, {
		key: "getRenderedPartDocx",
		value: function getRenderedPartDocx(rId, size, centered) {
			return centered ? templates.getImageXmlCentered(rId, size) : templates.getImageXml(rId, size);
		}
	}, {
		key: "getNextImageName",
		value: function getNextImageName() {
			var name = "image_generated_" + this.imageNumber + ".png";
			this.imageNumber++;
			return name;
		}
	}]);

	return ImageModule;
}();

module.exports = ImageModule;
},{"./imgManager":2,"./templates":3,"docxtemplater":5,"xmldom":25}],1:[function(require,module,exports){
"use strict";

var DocUtils = require("docxtemplater").DocUtils;
DocUtils.convertPixelsToEmus = function (pixel) {
	return Math.round(pixel * 9525);
};
module.exports = DocUtils;
},{"docxtemplater":5}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocUtils = require("./docUtils");
var extensionRegex = /[^.]+\.([^.]+)/;

var rels = {
	getPrefix: function getPrefix(fileType) {
		return fileType === "docx" ? "word" : "ppt";
	},
	getFileTypeName: function getFileTypeName(fileType) {
		return fileType === "docx" ? "document" : "presentation";
	},
	getRelsFileName: function getRelsFileName(fileName) {
		return fileName.replace(/^.*?([a-zA-Z0-9]+)\.xml$/, "$1") + ".xml.rels";
	},
	getRelsFilePath: function getRelsFilePath(fileName, fileType) {
		var relsFileName = rels.getRelsFileName(fileName);
		var prefix = fileType === "pptx" ? "ppt/slides" : "word";
		return prefix + "/_rels/" + relsFileName;
	}
};

module.exports = function () {
	function ImgManager(zip, fileName, xmlDocuments, fileType) {
		_classCallCheck(this, ImgManager);

		this.fileName = fileName;
		this.prefix = rels.getPrefix(fileType);
		this.zip = zip;
		this.xmlDocuments = xmlDocuments;
		this.fileTypeName = rels.getFileTypeName(fileType);
		this.mediaPrefix = fileType === "pptx" ? "../media" : "media";
		var relsFilePath = rels.getRelsFilePath(fileName, fileType);
		this.relsDoc = xmlDocuments[relsFilePath] || this.createEmptyRelsDoc(xmlDocuments, relsFilePath);
	}

	_createClass(ImgManager, [{
		key: "createEmptyRelsDoc",
		value: function createEmptyRelsDoc(xmlDocuments, relsFileName) {
			var mainRels = this.prefix + "/_rels/" + this.fileTypeName + ".xml.rels";
			var doc = xmlDocuments[mainRels];
			if (!doc) {
				var err = new Error("Could not copy from empty relsdoc");
				err.properties = {
					mainRels: mainRels,
					relsFileName: relsFileName,
					files: Object.keys(this.zip.files)
				};
				throw err;
			}
			var relsDoc = DocUtils.str2xml(DocUtils.xml2str(doc));
			var relationships = relsDoc.getElementsByTagName("Relationships")[0];
			var relationshipChilds = relationships.getElementsByTagName("Relationship");
			for (var i = 0, l = relationshipChilds.length; i < l; i++) {
				relationships.removeChild(relationshipChilds[i]);
			}
			xmlDocuments[relsFileName] = relsDoc;
			return relsDoc;
		}
	}, {
		key: "loadImageRels",
		value: function loadImageRels() {
			var iterable = this.relsDoc.getElementsByTagName("Relationship");
			return Array.prototype.reduce.call(iterable, function (max, relationship) {
				var id = relationship.getAttribute("Id");
				if (/^rId[0-9]+$/.test(id)) {
					return Math.max(max, parseInt(id.substr(3), 10));
				}
				return max;
			}, 0);
		}
		// Add an extension type in the [Content_Types.xml], is used if for example you want word to be able to read png files (for every extension you add you need a contentType)

	}, {
		key: "addExtensionRels",
		value: function addExtensionRels(contentType, extension) {
			var contentTypeDoc = this.xmlDocuments["[Content_Types].xml"];
			var defaultTags = contentTypeDoc.getElementsByTagName("Default");
			var extensionRegistered = Array.prototype.some.call(defaultTags, function (tag) {
				return tag.getAttribute("Extension") === extension;
			});
			if (extensionRegistered) {
				return;
			}
			var types = contentTypeDoc.getElementsByTagName("Types")[0];
			var newTag = contentTypeDoc.createElement("Default");
			newTag.namespaceURI = null;
			newTag.setAttribute("ContentType", contentType);
			newTag.setAttribute("Extension", extension);
			types.appendChild(newTag);
		}
		// Add an image and returns it's Rid

	}, {
		key: "addImageRels",
		value: function addImageRels(imageName, imageData, i) {
			if (i == null) {
				i = 0;
			}
			var realImageName = i === 0 ? imageName : imageName + ("(" + i + ")");
			var imagePath = this.prefix + "/media/" + realImageName;
			if (this.zip.files[imagePath] != null) {
				return this.addImageRels(imageName, imageData, i + 1);
			}
			var image = {
				name: imagePath,
				data: imageData,
				options: {
					binary: true
				}
			};
			this.zip.file(image.name, image.data, image.options);
			var extension = realImageName.replace(extensionRegex, "$1");
			this.addExtensionRels("image/" + extension, extension);
			var relationships = this.relsDoc.getElementsByTagName("Relationships")[0];
			var newTag = this.relsDoc.createElement("Relationship");
			newTag.namespaceURI = null;
			var maxRid = this.loadImageRels() + 1;
			newTag.setAttribute("Id", "rId" + maxRid);
			newTag.setAttribute("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image");
			newTag.setAttribute("Target", this.mediaPrefix + "/" + realImageName);
			relationships.appendChild(newTag);
			return maxRid;
		}
	}]);

	return ImgManager;
}();
},{"./docUtils":1}],3:[function(require,module,exports){
"use strict";

module.exports = {
	getImageXml: function getImageXml(rId, size) {
		return ("<w:drawing>\n\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t<wp:extent cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>\n\t\t\t<wp:docPr id=\"2\" name=\"Image 2\" descr=\"image\"/>\n\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t\t<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>\n\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id=\"0\" name=\"Picture 1\" descr=\"image\"/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed=\"rId" + rId + "\">\n\t\t\t\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t\t\t\t<a:ext uri=\"{28A0092B-C50C-407E-A947-70E740481C1C}\">\n\t\t\t\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" val=\"0\"/>\n\t\t\t\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t\t\t\t</a:extLst>\n\t\t\t\t\t\t\t</a:blip>\n\t\t\t\t\t\t\t<a:srcRect/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t<pic:spPr bwMode=\"auto\">\n\t\t\t\t\t\t\t<a:xfrm>\n\t\t\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t\t\t<a:ext cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln>\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t</pic:pic>\n\t\t\t\t</a:graphicData>\n\t\t\t</a:graphic>\n\t\t</wp:inline>\n\t</w:drawing>\n\t\t").replace(/\t|\n/g, "");
	},
	getImageXmlCentered: function getImageXmlCentered(rId, size) {
		return ("<w:p>\n\t\t\t<w:pPr>\n\t\t\t\t<w:jc w:val=\"center\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:r>\n\t\t\t\t<w:rPr/>\n\t\t\t\t<w:drawing>\n\t\t\t\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t\t\t<wp:extent cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t\t<wp:docPr id=\"0\" name=\"Picture\" descr=\"\"/>\n\t\t\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t\t\t<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id=\"0\" name=\"Picture\" descr=\"\"/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed=\"rId" + rId + "\"/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t\t<pic:spPr bwMode=\"auto\">\n\t\t\t\t\t\t\t<a:xfrm>\n\t\t\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t\t\t<a:ext cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln w=\"9525\">\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t\t<a:miter lim=\"800000\"/>\n\t\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t\t</pic:pic>\n\t\t\t\t\t\t</a:graphicData>\n\t\t\t\t\t</a:graphic>\n\t\t\t\t\t</wp:inline>\n\t\t\t\t</w:drawing>\n\t\t\t</w:r>\n\t\t</w:p>\n\t\t").replace(/\t|\n/g, "");
	},
	getPptxImageXml: function getPptxImageXml(rId, size, offset) {
		return ("<p:pic>\n\t\t\t<p:nvPicPr>\n\t\t\t\t<p:cNvPr id=\"6\" name=\"Picture 2\"/>\n\t\t\t\t<p:cNvPicPr>\n\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t</p:cNvPicPr>\n\t\t\t\t<p:nvPr/>\n\t\t\t</p:nvPicPr>\n\t\t\t<p:blipFill>\n\t\t\t\t<a:blip r:embed=\"rId" + rId + "\" cstate=\"print\">\n\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t<a:ext uri=\"{28A0092B-C50C-407E-A947-70E740481C1C}\">\n\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" val=\"0\"/>\n\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t</a:extLst>\n\t\t\t\t</a:blip>\n\t\t\t\t<a:srcRect/>\n\t\t\t\t<a:stretch>\n\t\t\t\t\t<a:fillRect/>\n\t\t\t\t</a:stretch>\n\t\t\t</p:blipFill>\n\t\t\t<p:spPr bwMode=\"auto\">\n\t\t\t\t<a:xfrm>\n\t\t\t\t\t<a:off x=\"" + offset.x + "\" y=\"" + offset.y + "\"/>\n\t\t\t\t\t<a:ext cx=\"" + size[0] + "\" cy=\"" + size[1] + "\"/>\n\t\t\t\t</a:xfrm>\n\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t<a:avLst/>\n\t\t\t\t</a:prstGeom>\n\t\t\t\t<a:noFill/>\n\t\t\t\t<a:ln>\n\t\t\t\t\t<a:noFill/>\n\t\t\t\t</a:ln>\n\t\t\t\t<a:effectLst/>\n\t\t\t\t<a:extLst>\n\t\t\t\t\t<a:ext uri=\"{909E8E84-426E-40DD-AFC4-6F175D3DCCD1}\">\n\t\t\t\t\t\t<a14:hiddenFill xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val=\"accent1\"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t</a14:hiddenFill>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri=\"{91240B29-F687-4F45-9708-019B960494DF}\">\n\t\t\t\t\t\t<a14:hiddenLine xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" w=\"9525\">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val=\"tx1\"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t\t<a:miter lim=\"800000\"/>\n\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t</a14:hiddenLine>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri=\"{AF507438-7753-43E0-B8FC-AC1667EBCBE1}\">\n\t\t\t\t\t\t<a14:hiddenEffects xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\">\n\t\t\t\t\t\t\t<a:effectLst>\n\t\t\t\t\t\t\t\t<a:outerShdw dist=\"35921\" dir=\"2700000\" algn=\"ctr\" rotWithShape=\"0\">\n\t\t\t\t\t\t\t\t\t<a:schemeClr val=\"bg2\"/>\n\t\t\t\t\t\t\t\t</a:outerShdw>\n\t\t\t\t\t\t\t</a:effectLst>\n\t\t\t\t\t\t</a14:hiddenEffects>\n\t\t\t\t\t</a:ext>\n\t\t\t\t</a:extLst>\n\t\t\t</p:spPr>\n\t\t</p:pic>\n\t\t").replace(/\t|\n/g, "");
	}
};
},{}],4:[function(require,module,exports){
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("xmldom"),
    DOMParser = _require.DOMParser,
    XMLSerializer = _require.XMLSerializer;

var _require2 = require("./errors"),
    throwXmlTagNotFound = _require2.throwXmlTagNotFound;

function parser(tag) {
  return _defineProperty({}, "get", function get(scope) {
    if (tag === ".") {
      return scope;
    }

    return scope[tag];
  });
}

function getNearestLeft(parsed, elements, index) {
  for (var i = index; i >= 0; i--) {
    var part = parsed[i];

    for (var j = 0, len = elements.length; j < len; j++) {
      var element = elements[j];

      if (part.value.indexOf("<" + element) === 0 && [">", " "].indexOf(part.value[element.length + 1]) !== -1) {
        return elements[j];
      }
    }
  }

  return null;
}

function getNearestRight(parsed, elements, index) {
  for (var i = index, l = parsed.length; i < l; i++) {
    var part = parsed[i];

    for (var j = 0, len = elements.length; j < len; j++) {
      var element = elements[j];

      if (part.value === "</" + element + ">") {
        return elements[j];
      }
    }
  }

  return -1;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function startsWith(str, prefix) {
  return str.substring(0, prefix.length) === prefix;
}

function unique(arr) {
  var hash = {},
      result = [];

  for (var i = 0, l = arr.length; i < l; ++i) {
    if (!hash.hasOwnProperty(arr[i])) {
      hash[arr[i]] = true;
      result.push(arr[i]);
    }
  }

  return result;
}

function chunkBy(parsed, f) {
  return parsed.reduce(function (chunks, p) {
    var currentChunk = last(chunks);

    if (currentChunk.length === 0) {
      currentChunk.push(p);
      return chunks;
    }

    var res = f(p);

    if (res === "start") {
      chunks.push([p]);
    } else if (res === "end") {
      currentChunk.push(p);
      chunks.push([]);
    } else {
      currentChunk.push(p);
    }

    return chunks;
  }, [[]]).filter(function (p) {
    return p.length > 0;
  });
}

function last(a) {
  return a[a.length - 1];
}

var defaults = {
  nullGetter: function nullGetter(part) {
    if (!part.module) {
      return "undefined";
    }

    if (part.module === "rawxml") {
      return "";
    }

    return "";
  },
  xmlFileNames: [],
  parser: parser,
  linebreaks: false,
  delimiters: {
    start: "{",
    end: "}"
  }
};

function mergeObjects() {
  var resObj = {};
  var obj, keys;

  for (var i = 0; i < arguments.length; i += 1) {
    obj = arguments[i];
    keys = Object.keys(obj);

    for (var j = 0; j < keys.length; j += 1) {
      resObj[keys[j]] = obj[keys[j]];
    }
  }

  return resObj;
}

function xml2str(xmlNode) {
  var a = new XMLSerializer();
  return a.serializeToString(xmlNode).replace(/xmlns(:[a-z0-9]+)?="" ?/g, "");
}

function str2xml(str) {
  var parser = new DOMParser();
  return parser.parseFromString(str, "text/xml");
}

var charMap = {
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
var regexStripRegexp = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

function escapeRegExp(str) {
  return str.replace(regexStripRegexp, "\\$&");
}

var charMapRegexes = Object.keys(charMap).map(function (endChar) {
  var startChar = charMap[endChar];
  return {
    rstart: new RegExp(escapeRegExp(startChar), "g"),
    rend: new RegExp(escapeRegExp(endChar), "g"),
    start: startChar,
    end: endChar
  };
});

function wordToUtf8(string) {
  var r;

  for (var i = 0, l = charMapRegexes.length; i < l; i++) {
    r = charMapRegexes[i];
    string = string.replace(r.rstart, r.end);
  }

  return string;
}

function utf8ToWord(string) {
  if (typeof string !== "string") {
    string = string.toString();
  }

  var r;

  for (var i = 0, l = charMapRegexes.length; i < l; i++) {
    r = charMapRegexes[i];
    string = string.replace(r.rend, r.start);
  }

  return string;
} // This function is written with for loops for performance


function concatArrays(arrays) {
  var result = [];

  for (var i = 0; i < arrays.length; i++) {
    var array = arrays[i];

    for (var j = 0, len = array.length; j < len; j++) {
      result.push(array[j]);
    }
  }

  return result;
}

var spaceRegexp = new RegExp(String.fromCharCode(160), "g");

function convertSpaces(s) {
  return s.replace(spaceRegexp, " ");
}

function pregMatchAll(regex, content) {
  /* regex is a string, content is the content. It returns an array of all matches with their offset, for example:
  	 regex=la
  	 content=lolalolilala
  returns: [{array: {0: 'la'},offset: 2},{array: {0: 'la'},offset: 8},{array: {0: 'la'} ,offset: 10}]
  */
  var matchArray = [];
  var match;

  while ((match = regex.exec(content)) != null) {
    matchArray.push({
      array: match,
      offset: match.index
    });
  }

  return matchArray;
}

function getRight(parsed, element, index) {
  var val = getRightOrNull(parsed, element, index);

  if (val !== null) {
    return val;
  }

  throwXmlTagNotFound({
    position: "right",
    element: element,
    parsed: parsed,
    index: index
  });
}

function getRightOrNull(parsed, element, index) {
  for (var i = index, l = parsed.length; i < l; i++) {
    var part = parsed[i];

    if (part.value === "</" + element + ">") {
      return i;
    }
  }

  return null;
}

function getLeft(parsed, element, index) {
  var val = getLeftOrNull(parsed, element, index);

  if (val !== null) {
    return val;
  }

  throwXmlTagNotFound({
    position: "left",
    element: element,
    parsed: parsed,
    index: index
  });
}

function getLeftOrNull(parsed, element, index) {
  for (var i = index; i >= 0; i--) {
    var part = parsed[i];

    if (part.value.indexOf("<" + element) === 0 && [">", " "].indexOf(part.value[element.length + 1]) !== -1) {
      return i;
    }
  }

  return null;
}

function isTagStart(tagType, _ref2) {
  var type = _ref2.type,
      tag = _ref2.tag,
      position = _ref2.position;
  return type === "tag" && tag === tagType && position === "start";
}

function isTagEnd(tagType, _ref3) {
  var type = _ref3.type,
      tag = _ref3.tag,
      position = _ref3.position;
  return type === "tag" && tag === tagType && position === "end";
}

function isParagraphStart(options) {
  return isTagStart("w:p", options) || isTagStart("a:p", options);
}

function isParagraphEnd(options) {
  return isTagEnd("w:p", options) || isTagEnd("a:p", options);
}

function isTextStart(part) {
  return part.type === "tag" && part.position === "start" && part.text;
}

function isTextEnd(part) {
  return part.type === "tag" && part.position === "end" && part.text;
}

function isContent(p) {
  return p.type === "placeholder" || p.type === "content" && p.position === "insidetag";
}

var corruptCharacters = /[\x00-\x08\x0B\x0C\x0E-\x1F]/; // 00    NUL '\0' (null character)
// 01    SOH (start of heading)
// 02    STX (start of text)
// 03    ETX (end of text)
// 04    EOT (end of transmission)
// 05    ENQ (enquiry)
// 06    ACK (acknowledge)
// 07    BEL '\a' (bell)
// 08    BS  '\b' (backspace)
// 0B    VT  '\v' (vertical tab)
// 0C    FF  '\f' (form feed)
// 0E    SO  (shift out)
// 0F    SI  (shift in)
// 10    DLE (data link escape)
// 11    DC1 (device control 1)
// 12    DC2 (device control 2)
// 13    DC3 (device control 3)
// 14    DC4 (device control 4)
// 15    NAK (negative ack.)
// 16    SYN (synchronous idle)
// 17    ETB (end of trans. blk)
// 18    CAN (cancel)
// 19    EM  (end of medium)
// 1A    SUB (substitute)
// 1B    ESC (escape)
// 1C    FS  (file separator)
// 1D    GS  (group separator)
// 1E    RS  (record separator)
// 1F    US  (unit separator)

function hasCorruptCharacters(string) {
  return corruptCharacters.test(string);
}

module.exports = {
  endsWith: endsWith,
  startsWith: startsWith,
  getNearestLeft: getNearestLeft,
  getNearestRight: getNearestRight,
  isContent: isContent,
  isParagraphStart: isParagraphStart,
  isParagraphEnd: isParagraphEnd,
  isTagStart: isTagStart,
  isTagEnd: isTagEnd,
  isTextStart: isTextStart,
  isTextEnd: isTextEnd,
  unique: unique,
  chunkBy: chunkBy,
  last: last,
  mergeObjects: mergeObjects,
  xml2str: xml2str,
  str2xml: str2xml,
  getRightOrNull: getRightOrNull,
  getRight: getRight,
  getLeftOrNull: getLeftOrNull,
  getLeft: getLeft,
  pregMatchAll: pregMatchAll,
  convertSpaces: convertSpaces,
  escapeRegExp: escapeRegExp,
  charMapRegexes: charMapRegexes,
  hasCorruptCharacters: hasCorruptCharacters,
  defaults: defaults,
  wordToUtf8: wordToUtf8,
  utf8ToWord: utf8ToWord,
  concatArrays: concatArrays,
  charMap: charMap
};
},{"./errors":6,"xmldom":25}],5:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DocUtils = require("./doc-utils");

DocUtils.traits = require("./traits");
DocUtils.moduleWrapper = require("./module-wrapper");

var Lexer = require("./lexer");

var defaults = DocUtils.defaults,
    str2xml = DocUtils.str2xml,
    xml2str = DocUtils.xml2str,
    moduleWrapper = DocUtils.moduleWrapper,
    utf8ToWord = DocUtils.utf8ToWord,
    concatArrays = DocUtils.concatArrays,
    unique = DocUtils.unique;

var _require = require("./errors"),
    XTInternalError = _require.XTInternalError,
    throwFileTypeNotIdentified = _require.throwFileTypeNotIdentified,
    throwFileTypeNotHandled = _require.throwFileTypeNotHandled,
    throwApiVersionError = _require.throwApiVersionError;

var currentModuleApiVersion = [3, 7, 0];

var Docxtemplater =
/*#__PURE__*/
function () {
  function Docxtemplater() {
    _classCallCheck(this, Docxtemplater);

    if (arguments.length > 0) {
      throw new Error("The constructor with parameters has been removed in docxtemplater 3, please check the upgrade guide.");
    }

    this.compiled = {};
    this.modules = [];
    this.setOptions({});
  }

  _createClass(Docxtemplater, [{
    key: "getModuleApiVersion",
    value: function getModuleApiVersion() {
      return currentModuleApiVersion.join(".");
    }
  }, {
    key: "verifyApiVersion",
    value: function verifyApiVersion(neededVersion) {
      neededVersion = neededVersion.split(".").map(function (i) {
        return parseInt(i, 10);
      });

      if (neededVersion.length !== 3) {
        throwApiVersionError("neededVersion is not a valid version", {
          neededVersion: neededVersion,
          explanation: "the neededVersion must be an array of length 3"
        });
      }

      if (neededVersion[0] !== currentModuleApiVersion[0]) {
        throwApiVersionError("The major api version do not match, you probably have to update docxtemplater with npm install --save docxtemplater", {
          neededVersion: neededVersion,
          currentModuleApiVersion: currentModuleApiVersion,
          explanation: "moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."), ", current=").concat(currentModuleApiVersion.join("."))
        });
      }

      if (neededVersion[1] > currentModuleApiVersion[1]) {
        throwApiVersionError("The minor api version is not uptodate, you probably have to update docxtemplater with npm install --save docxtemplater", {
          neededVersion: neededVersion,
          currentModuleApiVersion: currentModuleApiVersion,
          explanation: "moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."), ", current=").concat(currentModuleApiVersion.join("."))
        });
      }

      return true;
    }
  }, {
    key: "setModules",
    value: function setModules(obj) {
      this.modules.forEach(function (module) {
        module.set(obj);
      });
    }
  }, {
    key: "sendEvent",
    value: function sendEvent(eventName) {
      this.modules.forEach(function (module) {
        module.on(eventName);
      });
    }
  }, {
    key: "attachModule",
    value: function attachModule(module) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var prefix = options.prefix;

      if (prefix) {
        module.prefix = prefix;
      }

      var wrappedModule = moduleWrapper(module);
      this.modules.push(wrappedModule);
      wrappedModule.on("attached");
      return this;
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      var _this = this;

      if (options.delimiters) {
        options.delimiters.start = utf8ToWord(options.delimiters.start);
        options.delimiters.end = utf8ToWord(options.delimiters.end);
      }

      this.options = options;
      Object.keys(defaults).forEach(function (key) {
        var defaultValue = defaults[key];
        _this.options[key] = _this.options[key] != null ? _this.options[key] : defaultValue;
        _this[key] = _this.options[key];
      });

      if (this.zip) {
        this.updateFileTypeConfig();
      }

      return this;
    }
  }, {
    key: "loadZip",
    value: function loadZip(zip) {
      if (zip.loadAsync) {
        throw new XTInternalError("Docxtemplater doesn't handle JSZip version >=3, see changelog");
      }

      this.zip = zip;
      this.updateFileTypeConfig();
      this.modules = concatArrays([this.fileTypeConfig.baseModules.map(function (moduleFunction) {
        return moduleFunction();
      }), this.modules]);
      return this;
    }
  }, {
    key: "compileFile",
    value: function compileFile(fileName) {
      var currentFile = this.createTemplateClass(fileName);
      currentFile.parse();
      this.compiled[fileName] = currentFile;
    }
  }, {
    key: "resolveData",
    value: function resolveData(data) {
      var _this2 = this;

      return Promise.all(Object.keys(this.compiled).map(function (from) {
        var currentFile = _this2.compiled[from];
        return currentFile.resolveTags(data);
      })).then(function (resolved) {
        return concatArrays(resolved);
      });
    }
  }, {
    key: "compile",
    value: function compile() {
      var _this3 = this;

      if (Object.keys(this.compiled).length) {
        return this;
      }

      this.options = this.modules.reduce(function (options, module) {
        return module.optionsTransformer(options, _this3);
      }, this.options);
      this.options.xmlFileNames = unique(this.options.xmlFileNames);
      this.xmlDocuments = this.options.xmlFileNames.reduce(function (xmlDocuments, fileName) {
        var content = _this3.zip.files[fileName].asText();

        xmlDocuments[fileName] = str2xml(content);
        return xmlDocuments;
      }, {});
      this.setModules({
        zip: this.zip,
        xmlDocuments: this.xmlDocuments
      });
      this.getTemplatedFiles();
      this.setModules({
        compiled: this.compiled
      }); // Loop inside all templatedFiles (ie xml files with content).
      // Sometimes they don't exist (footer.xml for example)

      this.templatedFiles.forEach(function (fileName) {
        if (_this3.zip.files[fileName] != null) {
          _this3.compileFile(fileName);
        }
      });
      return this;
    }
  }, {
    key: "updateFileTypeConfig",
    value: function updateFileTypeConfig() {
      var fileType;

      if (this.zip.files.mimetype) {
        fileType = "odt";
      }

      if (this.zip.files["word/document.xml"] || this.zip.files["word/document2.xml"]) {
        fileType = "docx";
      }

      if (this.zip.files["ppt/presentation.xml"]) {
        fileType = "pptx";
      }

      if (fileType === "odt") {
        throwFileTypeNotHandled(fileType);
      }

      if (!fileType) {
        throwFileTypeNotIdentified();
      }

      this.fileType = fileType;
      this.fileTypeConfig = this.options.fileTypeConfig || Docxtemplater.FileTypeConfig[this.fileType];
      return this;
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      this.compile();
      this.setModules({
        data: this.data,
        Lexer: Lexer
      });
      this.mapper = this.modules.reduce(function (value, module) {
        return module.getRenderedMap(value);
      }, {});
      this.fileTypeConfig.tagsXmlLexedArray = unique(this.fileTypeConfig.tagsXmlLexedArray);
      this.fileTypeConfig.tagsXmlTextArray = unique(this.fileTypeConfig.tagsXmlTextArray);
      Object.keys(this.mapper).forEach(function (to) {
        var _this4$mapper$to = _this4.mapper[to],
            from = _this4$mapper$to.from,
            data = _this4$mapper$to.data;
        var currentFile = _this4.compiled[from];
        currentFile.setTags(data);
        currentFile.render(to);

        _this4.zip.file(to, currentFile.content, {
          createFolders: true
        });
      });
      this.sendEvent("syncing-zip");
      this.syncZip();
      return this;
    }
  }, {
    key: "syncZip",
    value: function syncZip() {
      var _this5 = this;

      Object.keys(this.xmlDocuments).forEach(function (fileName) {
        _this5.zip.remove(fileName);

        var content = xml2str(_this5.xmlDocuments[fileName]);
        return _this5.zip.file(fileName, content, {
          createFolders: true
        });
      });
    }
  }, {
    key: "setData",
    value: function setData(data) {
      this.data = data;
      return this;
    }
  }, {
    key: "getZip",
    value: function getZip() {
      return this.zip;
    }
  }, {
    key: "createTemplateClass",
    value: function createTemplateClass(path) {
      var usedData = this.zip.files[path].asText();
      return this.createTemplateClassFromContent(usedData, path);
    }
  }, {
    key: "createTemplateClassFromContent",
    value: function createTemplateClassFromContent(content, filePath) {
      var _this6 = this;

      var xmltOptions = {
        filePath: filePath
      };
      Object.keys(defaults).forEach(function (key) {
        xmltOptions[key] = _this6[key];
      });
      xmltOptions.fileTypeConfig = this.fileTypeConfig;
      xmltOptions.modules = this.modules;
      return new Docxtemplater.XmlTemplater(content, xmltOptions);
    }
  }, {
    key: "getFullText",
    value: function getFullText(path) {
      return this.createTemplateClass(path || this.fileTypeConfig.textPath(this.zip)).getFullText();
    }
  }, {
    key: "getTemplatedFiles",
    value: function getTemplatedFiles() {
      this.templatedFiles = this.fileTypeConfig.getTemplatedFiles(this.zip);
      return this.templatedFiles;
    }
  }]);

  return Docxtemplater;
}();

Docxtemplater.DocUtils = DocUtils;
Docxtemplater.Errors = require("./errors");
Docxtemplater.XmlTemplater = require("./xml-templater");
Docxtemplater.FileTypeConfig = require("./file-type-config");
Docxtemplater.XmlMatcher = require("./xml-matcher");
module.exports = Docxtemplater;
},{"./doc-utils":4,"./errors":6,"./file-type-config":7,"./lexer":8,"./module-wrapper":10,"./traits":22,"./xml-matcher":23,"./xml-templater":24}],6:[function(require,module,exports){
"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function first(a) {
  return a[0];
}

function last(a) {
  return a[a.length - 1];
}

function XTError(message) {
  this.name = "GenericError";
  this.message = message;
  this.stack = new Error(message).stack;
}

XTError.prototype = Error.prototype;

function XTTemplateError(message) {
  this.name = "TemplateError";
  this.message = message;
  this.stack = new Error(message).stack;
}

XTTemplateError.prototype = new XTError();

function RenderingError(message) {
  this.name = "RenderingError";
  this.message = message;
  this.stack = new Error(message).stack;
}

RenderingError.prototype = new XTError();

function XTScopeParserError(message) {
  this.name = "ScopeParserError";
  this.message = message;
  this.stack = new Error(message).stack;
}

XTScopeParserError.prototype = new XTError();

function XTInternalError(message) {
  this.name = "InternalError";
  this.properties = {
    explanation: "InternalError"
  };
  this.message = message;
  this.stack = new Error(message).stack;
}

XTInternalError.prototype = new XTError();

function XTAPIVersionError(message) {
  this.name = "APIVersionError";
  this.properties = {
    explanation: "APIVersionError"
  };
  this.message = message;
  this.stack = new Error(message).stack;
}

XTAPIVersionError.prototype = new XTError();

function throwApiVersionError(msg, properties) {
  var err = new XTAPIVersionError(msg);
  err.properties = _objectSpread({
    id: "api_version_error"
  }, properties);
  throw err;
}

function throwMultiError(errors) {
  var err = new XTTemplateError("Multi error");
  err.properties = {
    errors: errors,
    id: "multi_error",
    explanation: "The template has multiple errors"
  };
  throw err;
}

function getUnopenedTagException(options) {
  var err = new XTTemplateError("Unopened tag");
  err.properties = {
    xtag: last(options.xtag.split(" ")),
    id: "unopened_tag",
    context: options.xtag,
    offset: options.offset,
    lIndex: options.lIndex,
    explanation: "The tag beginning with \"".concat(options.xtag.substr(0, 10), "\" is unopened")
  };
  return err;
}

function getUnclosedTagException(options) {
  var err = new XTTemplateError("Unclosed tag");
  err.properties = {
    xtag: first(options.xtag.split(" ")).substr(1),
    id: "unclosed_tag",
    context: options.xtag,
    offset: options.offset,
    lIndex: options.lIndex,
    explanation: "The tag beginning with \"".concat(options.xtag.substr(0, 10), "\" is unclosed")
  };
  return err;
}

function throwXmlTagNotFound(options) {
  var err = new XTTemplateError("No tag \"".concat(options.element, "\" was found at the ").concat(options.position));
  err.properties = {
    id: "no_xml_tag_found_at_".concat(options.position),
    explanation: "No tag \"".concat(options.element, "\" was found at the ").concat(options.position),
    part: options.parsed[options.index],
    parsed: options.parsed,
    index: options.index,
    element: options.element
  };
  throw err;
}

function throwCorruptCharacters(_ref) {
  var tag = _ref.tag,
      value = _ref.value;
  var err = new RenderingError("There are some XML corrupt characters");
  err.properties = {
    id: "invalid_xml_characters",
    xtag: tag,
    value: value,
    explanation: "There are some corrupt characters for the field ${tag}"
  };
  throw err;
}

function throwContentMustBeString(type) {
  var err = new XTInternalError("Content must be a string");
  err.properties.id = "xmltemplater_content_must_be_string";
  err.properties.type = type;
  throw err;
}

function throwRawTagNotInParagraph(options) {
  var err = new XTTemplateError("Raw tag not in paragraph");
  var _options$part = options.part,
      value = _options$part.value,
      offset = _options$part.offset;
  err.properties = {
    id: "raw_tag_outerxml_invalid",
    explanation: "The tag \"".concat(value, "\" is not inside a paragraph"),
    rootError: options.rootError,
    xtag: value,
    offset: offset,
    postparsed: options.postparsed,
    expandTo: options.expandTo,
    index: options.index
  };
  throw err;
}

function throwRawTagShouldBeOnlyTextInParagraph(options) {
  var err = new XTTemplateError("Raw tag should be the only text in paragraph");
  var tag = options.part.value;
  err.properties = {
    id: "raw_xml_tag_should_be_only_text_in_paragraph",
    explanation: "The raw tag \"".concat(tag, "\" should be the only text in this paragraph. This means that this tag should not be surrounded by any text or spaces."),
    xtag: tag,
    offset: options.part.offset,
    paragraphParts: options.paragraphParts
  };
  throw err;
}

function getUnmatchedLoopException(options) {
  var location = options.location;
  var t = location === "start" ? "unclosed" : "unopened";
  var T = location === "start" ? "Unclosed" : "Unopened";
  var err = new XTTemplateError("".concat(T, " loop"));
  var tag = options.part.value;
  err.properties = {
    id: "".concat(t, "_loop"),
    explanation: "The loop with tag \"".concat(tag, "\" is ").concat(t),
    xtag: tag
  };
  return err;
}

function getClosingTagNotMatchOpeningTag(options) {
  var tags = options.tags;
  var err = new XTTemplateError("Closing tag does not match opening tag");
  err.properties = {
    id: "closing_tag_does_not_match_opening_tag",
    explanation: "The tag \"".concat(tags[0].value, "\" is closed by the tag \"").concat(tags[1].value, "\""),
    openingtag: tags[0].value,
    offset: [tags[0].offset, tags[1].offset],
    closingtag: tags[1].value
  };
  return err;
}

function getScopeCompilationError(_ref2) {
  var tag = _ref2.tag,
      rootError = _ref2.rootError;
  var err = new XTScopeParserError("Scope parser compilation failed");
  err.properties = {
    id: "scopeparser_compilation_failed",
    tag: tag,
    explanation: "The scope parser for the tag \"".concat(tag, "\" failed to compile"),
    rootError: rootError
  };
  return err;
}

function getScopeParserExecutionError(_ref3) {
  var tag = _ref3.tag,
      scope = _ref3.scope,
      error = _ref3.error;
  var err = new XTScopeParserError("Scope parser execution failed");
  err.properties = {
    id: "scopeparser_execution_failed",
    explanation: "The scope parser for the tag ".concat(tag, " failed to execute"),
    scope: scope,
    tag: tag,
    rootError: error
  };
  return err;
}

function getLoopPositionProducesInvalidXMLError(_ref4) {
  var tag = _ref4.tag;
  var err = new XTTemplateError("The position of the loop tags \"".concat(tag, "\" would produce invalid XML"));
  err.properties = {
    tag: tag,
    id: "loop_position_invalid",
    explanation: "The tags \"".concat(tag, "\" are misplaced in the document, for example one of them is in a table and the other one outside the table")
  };
  return err;
}

function throwUnimplementedTagType(part) {
  var err = new XTTemplateError("Unimplemented tag type \"".concat(part.type, "\""));
  err.properties = {
    part: part,
    id: "unimplemented_tag_type"
  };
  throw err;
}

function throwMalformedXml(part) {
  var err = new XTInternalError("Malformed xml");
  err.properties = {
    part: part,
    id: "malformed_xml"
  };
  throw err;
}

function throwLocationInvalid(part) {
  throw new XTInternalError("Location should be one of \"start\" or \"end\" (given : ".concat(part.location, ")"));
}

function throwFileTypeNotHandled(fileType) {
  var err = new XTInternalError("The filetype \"".concat(fileType, "\" is not handled by docxtemplater"));
  err.properties = {
    id: "filetype_not_handled",
    explanation: "The file you are trying to generate is of type \"".concat(fileType, "\", but only docx and pptx formats are handled"),
    fileType: fileType
  };
  throw err;
}

function throwFileTypeNotIdentified() {
  var err = new XTInternalError("The filetype for this file could not be identified, is this file corrupted ?");
  err.properties = {
    id: "filetype_not_identified"
  };
  throw err;
}

function throwXmlInvalid(content, offset) {
  var err = new XTTemplateError("An XML file has invalid xml");
  err.properties = {
    id: "file_has_invalid_xml",
    content: content,
    offset: offset,
    explanation: "The docx contains invalid XML, it is most likely corrupt"
  };
  throw err;
}

module.exports = {
  XTError: XTError,
  XTTemplateError: XTTemplateError,
  XTInternalError: XTInternalError,
  XTScopeParserError: XTScopeParserError,
  XTAPIVersionError: XTAPIVersionError,
  RenderingError: RenderingError,
  getClosingTagNotMatchOpeningTag: getClosingTagNotMatchOpeningTag,
  getLoopPositionProducesInvalidXMLError: getLoopPositionProducesInvalidXMLError,
  getScopeCompilationError: getScopeCompilationError,
  getScopeParserExecutionError: getScopeParserExecutionError,
  getUnclosedTagException: getUnclosedTagException,
  getUnmatchedLoopException: getUnmatchedLoopException,
  getUnopenedTagException: getUnopenedTagException,
  throwApiVersionError: throwApiVersionError,
  throwContentMustBeString: throwContentMustBeString,
  throwCorruptCharacters: throwCorruptCharacters,
  throwFileTypeNotHandled: throwFileTypeNotHandled,
  throwFileTypeNotIdentified: throwFileTypeNotIdentified,
  throwLocationInvalid: throwLocationInvalid,
  throwMalformedXml: throwMalformedXml,
  throwMultiError: throwMultiError,
  throwRawTagNotInParagraph: throwRawTagNotInParagraph,
  throwRawTagShouldBeOnlyTextInParagraph: throwRawTagShouldBeOnlyTextInParagraph,
  throwUnimplementedTagType: throwUnimplementedTagType,
  throwXmlTagNotFound: throwXmlTagNotFound,
  throwXmlInvalid: throwXmlInvalid
};
},{}],7:[function(require,module,exports){
"use strict";

var loopModule = require("./modules/loop");

var spacePreserveModule = require("./modules/space-preserve");

var rawXmlModule = require("./modules/rawxml");

var expandPairTrait = require("./modules/expand-pair-trait");

var render = require("./modules/render");

var PptXFileTypeConfig = {
  getTemplatedFiles: function getTemplatedFiles(zip) {
    var slideTemplates = zip.file(/ppt\/(slides|slideMasters)\/(slide|slideMaster)\d+\.xml/).map(function (file) {
      return file.name;
    });
    return slideTemplates.concat(["ppt/presentation.xml", "docProps/app.xml", "docProps/core.xml"]);
  },
  textPath: function textPath() {
    return "ppt/slides/slide1.xml";
  },
  tagsXmlTextArray: ["Company", "HyperlinkBase", "Manager", "cp:category", "cp:keywords", "dc:creator", "dc:description", "dc:subject", "dc:title", "a:t", "m:t", "vt:lpstr"],
  tagsXmlLexedArray: ["p:sp", "a:tc", "a:tr", "a:table", "a:p", "a:r", "a:rPr"],
  expandTags: [{
    contains: "a:tc",
    expand: "a:tr"
  }],
  onParagraphLoop: [{
    contains: "a:p",
    expand: "a:p",
    onlyTextInTag: true
  }],
  tagRawXml: "p:sp",
  tagTextXml: "a:t",
  baseModules: [loopModule, expandPairTrait, rawXmlModule, render]
};
var DocXFileTypeConfig = {
  getTemplatedFiles: function getTemplatedFiles(zip) {
    var baseTags = ["docProps/core.xml", "docProps/app.xml", "word/document.xml", "word/document2.xml"];
    var slideTemplates = zip.file(/word\/(header|footer)\d+\.xml/).map(function (file) {
      return file.name;
    });
    return slideTemplates.concat(baseTags);
  },
  textPath: function textPath(zip) {
    if (zip.files["word/document.xml"]) {
      return "word/document.xml";
    }

    if (zip.files["word/document2.xml"]) {
      return "word/document2.xml";
    }
  },
  tagsXmlTextArray: ["Company", "HyperlinkBase", "Manager", "cp:category", "cp:keywords", "dc:creator", "dc:description", "dc:subject", "dc:title", "w:t", "m:t", "vt:lpstr"],
  tagsXmlLexedArray: ["w:tc", "w:tr", "w:table", "w:p", "w:r", "w:rPr", "w:pPr", "w:spacing"],
  expandTags: [{
    contains: "w:tc",
    expand: "w:tr"
  }],
  onParagraphLoop: [{
    contains: "w:p",
    expand: "w:p",
    onlyTextInTag: true
  }],
  tagRawXml: "w:p",
  tagTextXml: "w:t",
  baseModules: [loopModule, spacePreserveModule, expandPairTrait, rawXmlModule, render]
};
module.exports = {
  docx: DocXFileTypeConfig,
  pptx: PptXFileTypeConfig
};
},{"./modules/expand-pair-trait":11,"./modules/loop":12,"./modules/rawxml":13,"./modules/render":14,"./modules/space-preserve":15}],8:[function(require,module,exports){
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require("./errors"),
    getUnclosedTagException = _require.getUnclosedTagException,
    getUnopenedTagException = _require.getUnopenedTagException,
    throwMalformedXml = _require.throwMalformedXml,
    throwXmlInvalid = _require.throwXmlInvalid;

var _require2 = require("./doc-utils"),
    concatArrays = _require2.concatArrays,
    isTextStart = _require2.isTextStart,
    isTextEnd = _require2.isTextEnd;

var EQUAL = 0;
var START = -1;
var END = 1;

function inRange(range, match) {
  return range[0] <= match.offset && match.offset < range[1];
}

function updateInTextTag(part, inTextTag) {
  if (isTextStart(part)) {
    if (inTextTag) {
      throwMalformedXml(part);
    }

    return true;
  }

  if (isTextEnd(part)) {
    if (!inTextTag) {
      throwMalformedXml(part);
    }

    return false;
  }

  return inTextTag;
}

function getTag(tag) {
  var position = "start";
  var start = 1;

  if (tag[tag.length - 2] === "/") {
    position = "selfclosing";
  }

  if (tag[1] === "/") {
    start = 2;
    position = "end";
  }

  var index = tag.indexOf(" ");
  var end = index === -1 ? tag.length - 1 : index;
  return {
    tag: tag.slice(start, end),
    position: position
  };
}

function tagMatcher(content, textMatchArray, othersMatchArray) {
  var cursor = 0;
  var contentLength = content.length;
  var allMatches = concatArrays([textMatchArray.map(function (tag) {
    return {
      tag: tag,
      text: true
    };
  }), othersMatchArray.map(function (tag) {
    return {
      tag: tag,
      text: false
    };
  })]).reduce(function (allMatches, t) {
    allMatches[t.tag] = t.text;
    return allMatches;
  }, {});
  var totalMatches = [];

  while (cursor < contentLength) {
    cursor = content.indexOf("<", cursor);

    if (cursor === -1) {
      break;
    }

    var offset = cursor;
    var nextOpening = content.indexOf("<", cursor + 1);
    cursor = content.indexOf(">", cursor);

    if (cursor === -1 || nextOpening !== -1 && cursor > nextOpening) {
      throwXmlInvalid(content, offset);
    }

    var tagText = content.slice(offset, cursor + 1);

    var _getTag = getTag(tagText),
        tag = _getTag.tag,
        position = _getTag.position;

    var text = allMatches[tag];

    if (text == null) {
      continue;
    }

    totalMatches.push({
      type: "tag",
      position: position,
      text: text,
      offset: offset,
      value: tagText,
      tag: tag
    });
  }

  return totalMatches;
}

function getDelimiterErrors(delimiterMatches, fullText, ranges) {
  if (delimiterMatches.length === 0) {
    return [];
  }

  var errors = [];
  var inDelimiter = false;
  var lastDelimiterMatch = {
    offset: 0
  };
  var xtag;
  var rangeIndex = 0;
  delimiterMatches.forEach(function (delimiterMatch) {
    while (ranges[rangeIndex + 1]) {
      if (ranges[rangeIndex + 1].offset > delimiterMatch.offset) {
        break;
      }

      rangeIndex++;
    }

    xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);

    if (delimiterMatch.position === "start" && inDelimiter || delimiterMatch.position === "end" && !inDelimiter) {
      if (delimiterMatch.position === "start") {
        errors.push(getUnclosedTagException({
          xtag: xtag,
          offset: lastDelimiterMatch.offset
        }));
        delimiterMatch.error = true;
      } else {
        errors.push(getUnopenedTagException({
          xtag: xtag,
          offset: delimiterMatch.offset
        }));
        delimiterMatch.error = true;
      }
    } else {
      inDelimiter = !inDelimiter;
    }

    lastDelimiterMatch = delimiterMatch;
  });
  var delimiterMatch = {
    offset: fullText.length
  };
  xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);

  if (inDelimiter) {
    errors.push(getUnclosedTagException({
      xtag: xtag,
      offset: lastDelimiterMatch.offset
    }));
    delimiterMatch.error = true;
  }

  return errors;
}

function compareOffsets(startOffset, endOffset) {
  if (startOffset === endOffset) {
    return EQUAL;
  }

  if (startOffset === -1 || endOffset === -1) {
    return endOffset < startOffset ? START : END;
  }

  return startOffset < endOffset ? START : END;
}

function splitDelimiters(inside) {
  var newDelimiters = inside.split(" ");

  if (newDelimiters.length !== 2) {
    throw new Error("New Delimiters cannot be parsed");
  }

  var _newDelimiters = _slicedToArray(newDelimiters, 2),
      start = _newDelimiters[0],
      end = _newDelimiters[1];

  if (start.length === 0 || end.length === 0) {
    throw new Error("New Delimiters cannot be parsed");
  }

  return [start, end];
}

function getAllIndexes(fullText, delimiters) {
  var indexes = [];
  var start = delimiters.start,
      end = delimiters.end;
  var offset = -1;

  while (true) {
    var startOffset = fullText.indexOf(start, offset + 1);
    var endOffset = fullText.indexOf(end, offset + 1);
    var position = null;
    var len = void 0;
    var compareResult = compareOffsets(startOffset, endOffset);

    if (compareResult === EQUAL) {
      return indexes;
    }

    if (compareResult === END) {
      offset = endOffset;
      position = "end";
      len = end.length;
    }

    if (compareResult === START) {
      offset = startOffset;
      position = "start";
      len = start.length;
    }

    if (position === "start" && fullText[offset + start.length] === "=") {
      indexes.push({
        offset: startOffset,
        position: "start",
        length: start.length,
        changedelimiter: true
      });
      var nextEqual = fullText.indexOf("=", offset + start.length + 1);

      var _endOffset = fullText.indexOf(end, nextEqual + 1);

      indexes.push({
        offset: _endOffset,
        position: "end",
        length: end.length,
        changedelimiter: true
      });
      var insideTag = fullText.substr(offset + start.length + 1, nextEqual - offset - start.length - 1);

      var _splitDelimiters = splitDelimiters(insideTag);

      var _splitDelimiters2 = _slicedToArray(_splitDelimiters, 2);

      start = _splitDelimiters2[0];
      end = _splitDelimiters2[1];
      offset = _endOffset;
      continue;
    }

    indexes.push({
      offset: offset,
      position: position,
      length: len
    });
  }
}

function Reader(innerContentParts) {
  var _this = this;

  this.innerContentParts = innerContentParts;
  this.full = "";

  this.parseDelimiters = function (delimiters) {
    _this.full = _this.innerContentParts.map(function (p) {
      return p.value;
    }).join("");
    var delimiterMatches = getAllIndexes(_this.full, delimiters);
    var offset = 0;

    var ranges = _this.innerContentParts.map(function (part) {
      offset += part.value.length;
      return {
        offset: offset - part.value.length,
        lIndex: part.lIndex
      };
    });

    var errors = getDelimiterErrors(delimiterMatches, _this.full, ranges);
    var cutNext = 0;
    var delimiterIndex = 0;
    _this.parsed = ranges.map(function (p, i) {
      var offset = p.offset;
      var range = [offset, offset + this.innerContentParts[i].value.length];
      var partContent = this.innerContentParts[i].value;
      var delimitersInOffset = [];

      while (delimiterIndex < delimiterMatches.length && inRange(range, delimiterMatches[delimiterIndex])) {
        delimitersInOffset.push(delimiterMatches[delimiterIndex]);
        delimiterIndex++;
      }

      var parts = [];
      var cursor = 0;

      if (cutNext > 0) {
        cursor = cutNext;
        cutNext = 0;
      }

      var insideDelimiterChange;
      delimitersInOffset.forEach(function (delimiterInOffset) {
        var value = partContent.substr(cursor, delimiterInOffset.offset - offset - cursor);

        if (value.length > 0) {
          if (insideDelimiterChange) {
            if (delimiterInOffset.changedelimiter) {
              cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
              insideDelimiterChange = delimiterInOffset.position === "start";
            }

            return;
          }

          parts.push({
            type: "content",
            value: value,
            offset: cursor + offset
          });
          cursor += value.length;
        }

        var delimiterPart = {
          type: "delimiter",
          position: delimiterInOffset.position,
          offset: cursor + offset
        };

        if (delimiterInOffset.error) {
          delimiterPart.error = delimiterInOffset.error;
        }

        if (delimiterInOffset.changedelimiter) {
          insideDelimiterChange = delimiterInOffset.position === "start";
          cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
          return;
        }

        parts.push(delimiterPart);
        cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
      });
      cutNext = cursor - partContent.length;
      var value = partContent.substr(cursor);

      if (value.length > 0) {
        parts.push({
          type: "content",
          value: value,
          offset: offset
        });
      }

      return parts;
    }, _this);
    _this.errors = errors;
  };
}

function getContentParts(xmlparsed) {
  var inTextTag = false;
  var innerContentParts = [];
  xmlparsed.forEach(function (part) {
    inTextTag = updateInTextTag(part, inTextTag);

    if (inTextTag && part.type === "content") {
      innerContentParts.push(part);
    }
  });
  return innerContentParts;
}

module.exports = {
  parse: function parse(xmlparsed, delimiters) {
    var inTextTag = false;
    var reader = new Reader(getContentParts(xmlparsed));
    reader.parseDelimiters(delimiters);
    var lexed = [];
    var index = 0;
    xmlparsed.forEach(function (part) {
      inTextTag = updateInTextTag(part, inTextTag);

      if (part.type === "content") {
        part.position = inTextTag ? "insidetag" : "outsidetag";
      }

      if (inTextTag && part.type === "content") {
        Array.prototype.push.apply(lexed, reader.parsed[index].map(function (p) {
          if (p.type === "content") {
            p.position = "insidetag";
          }

          return p;
        }));
        index++;
      } else {
        lexed.push(part);
      }
    });
    lexed = lexed.map(function (p, i) {
      p.lIndex = i;
      return p;
    });
    return {
      errors: reader.errors,
      lexed: lexed
    };
  },
  xmlparse: function xmlparse(content, xmltags) {
    var matches = tagMatcher(content, xmltags.text, xmltags.other);
    var cursor = 0;
    var parsed = matches.reduce(function (parsed, match) {
      var value = content.substr(cursor, match.offset - cursor);

      if (value.length > 0) {
        parsed.push({
          type: "content",
          value: value
        });
      }

      cursor = match.offset + match.value.length;
      delete match.offset;

      if (match.value.length > 0) {
        parsed.push(match);
      }

      return parsed;
    }, []);
    var value = content.substr(cursor);

    if (value.length > 0) {
      parsed.push({
        type: "content",
        value: value
      });
    }

    return parsed;
  }
};
},{"./doc-utils":4,"./errors":6}],9:[function(require,module,exports){
"use strict";

function getMinFromArrays(arrays, state) {
  var minIndex = -1;

  for (var i = 0, l = arrays.length; i < l; i++) {
    if (state[i] >= arrays[i].length) {
      continue;
    }

    if (minIndex === -1 || arrays[i][state[i]].offset < arrays[minIndex][state[minIndex]].offset) {
      minIndex = i;
    }
  }

  if (minIndex === -1) {
    throw new Error("minIndex negative");
  }

  return minIndex;
}

module.exports = function (arrays) {
  var totalLength = arrays.reduce(function (sum, array) {
    return sum + array.length;
  }, 0);
  arrays = arrays.filter(function (array) {
    return array.length > 0;
  });
  var resultArray = new Array(totalLength);
  var state = arrays.map(function () {
    return 0;
  });
  var i = 0;

  while (i <= totalLength - 1) {
    var arrayIndex = getMinFromArrays(arrays, state);
    resultArray[i] = arrays[arrayIndex][state[arrayIndex]];
    state[arrayIndex]++;
    i++;
  }

  return resultArray;
};
},{}],10:[function(require,module,exports){
"use strict";

function emptyFun() {}

function identity(i) {
  return i;
}

module.exports = function (module) {
  var defaults = {
    set: emptyFun,
    parse: emptyFun,
    render: emptyFun,
    getTraits: emptyFun,
    nullGetter: emptyFun,
    optionsTransformer: identity,
    postrender: identity,
    errorsTransformer: identity,
    getRenderedMap: identity,
    postparse: identity,
    on: emptyFun,
    resolve: emptyFun
  };

  if (Object.keys(defaults).every(function (key) {
    return !module[key];
  })) {
    throw new Error("This module cannot be wrapped, because it doesn't define any of the necessary functions");
  }

  Object.keys(defaults).forEach(function (key) {
    module[key] = module[key] || defaults[key];
  });
  return module;
};
},{}],11:[function(require,module,exports){
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var traitName = "expandPair";

var mergeSort = require("../mergesort");

var _require = require("../doc-utils"),
    getLeft = _require.getLeft,
    getRight = _require.getRight,
    getNearestLeft = _require.getNearestLeft,
    getNearestRight = _require.getNearestRight;

var wrapper = require("../module-wrapper");

var _require2 = require("../traits"),
    getExpandToDefault = _require2.getExpandToDefault;

var _require3 = require("../errors"),
    getUnmatchedLoopException = _require3.getUnmatchedLoopException,
    getClosingTagNotMatchOpeningTag = _require3.getClosingTagNotMatchOpeningTag,
    throwLocationInvalid = _require3.throwLocationInvalid;

function getOpenCountChange(part) {
  switch (part.location) {
    case "start":
      return 1;

    case "end":
      return -1;

    default:
      throwLocationInvalid(part);
  }
}

function getPairs(traits) {
  var errors = [];
  var pairs = [];

  if (traits.length === 0) {
    return {
      pairs: pairs,
      errors: errors
    };
  }

  var countOpen = 1;

  var _traits = _slicedToArray(traits, 1),
      firstTrait = _traits[0];

  if (firstTrait.part.location === "start") {
    for (var i = 1; i < traits.length; i++) {
      var currentTrait = traits[i];
      countOpen += getOpenCountChange(currentTrait.part);

      if (countOpen === 0) {
        var _outer = getPairs(traits.slice(i + 1));

        if (currentTrait.part.value !== firstTrait.part.value && currentTrait.part.value !== "") {
          errors.push(getClosingTagNotMatchOpeningTag({
            tags: [firstTrait.part, currentTrait.part]
          }));
        } else {
          pairs = [[firstTrait, currentTrait]];
        }

        return {
          pairs: pairs.concat(_outer.pairs),
          errors: errors.concat(_outer.errors)
        };
      }
    }
  }

  var part = firstTrait.part;
  errors.push(getUnmatchedLoopException({
    part: part,
    location: part.location
  }));
  var outer = getPairs(traits.slice(1));
  return {
    pairs: outer.pairs,
    errors: errors.concat(outer.errors)
  };
}

var expandPairTrait = {
  name: "ExpandPairTrait",
  optionsTransformer: function optionsTransformer(options, docxtemplater) {
    this.expandTags = docxtemplater.fileTypeConfig.expandTags.concat(docxtemplater.options.paragraphLoop ? docxtemplater.fileTypeConfig.onParagraphLoop : []);
    return options;
  },
  postparse: function postparse(postparsed, _ref) {
    var _this = this;

    var getTraits = _ref.getTraits,
        _postparse = _ref.postparse;
    var traits = getTraits(traitName, postparsed);
    traits = traits.map(function (trait) {
      return trait || [];
    });
    traits = mergeSort(traits);

    var _getPairs = getPairs(traits),
        pairs = _getPairs.pairs,
        errors = _getPairs.errors;

    var expandedPairs = pairs.map(function (pair) {
      var expandTo = pair[0].part.expandTo;

      if (expandTo === "auto") {
        var result = getExpandToDefault(postparsed, pair, _this.expandTags);

        if (result.error) {
          errors.push(result.error);
        }

        expandTo = result.value;
      }

      if (!expandTo) {
        return [pair[0].offset, pair[1].offset];
      }

      var left = getLeft(postparsed, expandTo, pair[0].offset);
      var right = getRight(postparsed, expandTo, pair[1].offset);
      return [left, right];
    });
    var currentPairIndex = 0;
    var innerParts;
    var newParsed = postparsed.reduce(function (newParsed, part, i) {
      var inPair = currentPairIndex < pairs.length && expandedPairs[currentPairIndex][0] <= i;
      var pair = pairs[currentPairIndex];
      var expandedPair = expandedPairs[currentPairIndex];

      if (!inPair) {
        newParsed.push(part);
        return newParsed;
      }

      var left = expandedPair[0];
      var right = expandedPair[1];
      var before = getNearestLeft(postparsed, ["w:p", "w:tc"], left - 1);
      var after = getNearestRight(postparsed, ["w:p", "w:tc"], right + 1);

      if (before === "w:tc" && after === "w:tc") {
        part.emptyValue = "<w:p></w:p>";
      }

      if (expandedPair[0] === i) {
        innerParts = [];
      }

      if (pair[0].offset !== i && pair[1].offset !== i) {
        innerParts.push(part);
      }

      if (expandedPair[1] === i) {
        var basePart = postparsed[pair[0].offset];
        basePart.subparsed = _postparse(innerParts, {
          basePart: basePart
        });
        delete basePart.location;
        delete basePart.expandTo;
        newParsed.push(basePart);
        currentPairIndex++;
      }

      return newParsed;
    }, []);
    return {
      postparsed: newParsed,
      errors: errors
    };
  }
};

module.exports = function () {
  return wrapper(expandPairTrait);
};
},{"../doc-utils":4,"../errors":6,"../mergesort":9,"../module-wrapper":10,"../traits":22}],12:[function(require,module,exports){
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require("../doc-utils"),
    mergeObjects = _require.mergeObjects,
    chunkBy = _require.chunkBy,
    last = _require.last,
    isParagraphStart = _require.isParagraphStart,
    isParagraphEnd = _require.isParagraphEnd,
    isContent = _require.isContent;

var wrapper = require("../module-wrapper");

var _require2 = require("../prefix-matcher"),
    match = _require2.match,
    getValue = _require2.getValue,
    getValues = _require2.getValues;

var moduleName = "loop";

function hasContent(parts) {
  return parts.some(function (part) {
    return isContent(part);
  });
}

function isEnclosedByParagraphs(parsed) {
  if (parsed.length === 0) {
    return false;
  }

  return isParagraphStart(parsed[0]) && isParagraphEnd(last(parsed));
}

function getOffset(chunk) {
  return hasContent(chunk) ? 0 : chunk.length;
}

var LoopModule =
/*#__PURE__*/
function () {
  function LoopModule() {
    _classCallCheck(this, LoopModule);

    this.name = "LoopModule";
    this.prefix = {
      start: "#",
      end: "/",
      dash: /^-([^\s]+)\s(.+)$/,
      inverted: "^"
    };
  }

  _createClass(LoopModule, [{
    key: "parse",
    value: function parse(placeHolderContent) {
      var module = moduleName;
      var type = "placeholder";
      var _this$prefix = this.prefix,
          start = _this$prefix.start,
          inverted = _this$prefix.inverted,
          dash = _this$prefix.dash,
          end = _this$prefix.end;

      if (match(start, placeHolderContent)) {
        return {
          type: type,
          value: getValue(start, placeHolderContent),
          expandTo: "auto",
          module: module,
          location: "start",
          inverted: false
        };
      }

      if (match(inverted, placeHolderContent)) {
        return {
          type: type,
          value: getValue(inverted, placeHolderContent),
          expandTo: "auto",
          module: module,
          location: "start",
          inverted: true
        };
      }

      if (match(end, placeHolderContent)) {
        return {
          type: type,
          value: getValue(end, placeHolderContent),
          module: module,
          location: "end"
        };
      }

      if (match(dash, placeHolderContent)) {
        var _getValues = getValues(dash, placeHolderContent),
            _getValues2 = _slicedToArray(_getValues, 3),
            expandTo = _getValues2[1],
            value = _getValues2[2];

        return {
          type: type,
          value: value,
          expandTo: expandTo,
          module: module,
          location: "start",
          inverted: false
        };
      }

      return null;
    }
  }, {
    key: "getTraits",
    value: function getTraits(traitName, parsed) {
      if (traitName !== "expandPair") {
        return;
      }

      return parsed.reduce(function (tags, part, offset) {
        if (part.type === "placeholder" && part.module === moduleName) {
          tags.push({
            part: part,
            offset: offset
          });
        }

        return tags;
      }, []);
    }
  }, {
    key: "postparse",
    value: function postparse(parsed, _ref) {
      var basePart = _ref.basePart;

      if (!isEnclosedByParagraphs(parsed)) {
        return parsed;
      }

      if (!basePart || basePart.expandTo !== "auto" || basePart.module !== moduleName) {
        return parsed;
      }

      var chunks = chunkBy(parsed, function (p) {
        if (isParagraphStart(p)) {
          return "start";
        }

        if (isParagraphEnd(p)) {
          return "end";
        }

        return null;
      });

      if (chunks.length <= 2) {
        return parsed;
      }

      var firstChunk = chunks[0];
      var lastChunk = last(chunks);
      var firstOffset = getOffset(firstChunk);
      var lastOffset = getOffset(lastChunk);

      if (firstOffset === 0 || lastOffset === 0) {
        return parsed;
      }

      return parsed.slice(firstOffset, parsed.length - lastOffset);
    }
  }, {
    key: "render",
    value: function render(part, options) {
      if (part.type !== "placeholder" || part.module !== moduleName) {
        return null;
      }

      var totalValue = [];
      var errors = [];

      function loopOver(scope, i) {
        var scopeManager = options.scopeManager.createSubScopeManager(scope, part.value, i, part);
        var subRendered = options.render(mergeObjects({}, options, {
          compiled: part.subparsed,
          tags: {},
          scopeManager: scopeManager
        }));
        totalValue = totalValue.concat(subRendered.parts);
        errors = errors.concat(subRendered.errors || []);
      }

      var result = options.scopeManager.loopOver(part.value, loopOver, part.inverted, {
        part: part
      });

      if (result === false) {
        return {
          value: part.emptyValue || "",
          errors: errors
        };
      }

      return {
        value: totalValue.join(""),
        errors: errors
      };
    }
  }, {
    key: "resolve",
    value: function resolve(part, options) {
      if (part.type !== "placeholder" || part.module !== moduleName) {
        return null;
      }

      var value = options.scopeManager.getValue(part.value, {
        part: part
      });
      var promises = [];

      function loopOver(scope, i) {
        var scopeManager = options.scopeManager.createSubScopeManager(scope, part.value, i, part);
        promises.push(options.resolve(mergeObjects(options, {
          compiled: part.subparsed,
          tags: {},
          scopeManager: scopeManager
        })));
      }

      return Promise.resolve(value).then(function (value) {
        options.scopeManager.loopOverValue(value, loopOver, part.inverted);
        return Promise.all(promises).then(function (r) {
          return r.map(function (_ref2) {
            var resolved = _ref2.resolved;
            return resolved;
          });
        });
      }).then(function (r) {
        return r;
      });
    }
  }]);

  return LoopModule;
}();

module.exports = function () {
  return wrapper(new LoopModule());
};
},{"../doc-utils":4,"../module-wrapper":10,"../prefix-matcher":18}],13:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var traits = require("../traits");

var _require = require("../doc-utils"),
    isContent = _require.isContent,
    getNearestLeft = _require.getNearestLeft,
    getNearestRight = _require.getNearestRight;

var _require2 = require("../errors"),
    throwRawTagShouldBeOnlyTextInParagraph = _require2.throwRawTagShouldBeOnlyTextInParagraph;

var _require3 = require("../prefix-matcher"),
    match = _require3.match,
    getValue = _require3.getValue;

var moduleName = "rawxml";

var wrapper = require("../module-wrapper");

function getInner(_ref) {
  var part = _ref.part,
      left = _ref.left,
      right = _ref.right,
      postparsed = _ref.postparsed,
      index = _ref.index;
  var before = getNearestLeft(postparsed, ["w:p", "w:tc"], left - 1);
  var after = getNearestRight(postparsed, ["w:p", "w:tc"], right + 1);

  if (after === "w:tc" && before === "w:tc") {
    part.emptyValue = "<w:p></w:p>";
  }

  var paragraphParts = postparsed.slice(left + 1, right);
  paragraphParts.forEach(function (p, i) {
    if (i === index - left - 1) {
      return;
    }

    if (isContent(p)) {
      throwRawTagShouldBeOnlyTextInParagraph({
        paragraphParts: paragraphParts,
        part: part
      });
    }
  });
  return part;
}

var RawXmlModule =
/*#__PURE__*/
function () {
  function RawXmlModule() {
    _classCallCheck(this, RawXmlModule);

    this.name = "RawXmlModule";
    this.prefix = "@";
  }

  _createClass(RawXmlModule, [{
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      this.fileTypeConfig = docxtemplater.fileTypeConfig;
      return options;
    }
  }, {
    key: "parse",
    value: function parse(placeHolderContent) {
      var type = "placeholder";

      if (match(this.prefix, placeHolderContent)) {
        return {
          type: type,
          value: getValue(this.prefix, placeHolderContent),
          module: moduleName
        };
      }

      return null;
    }
  }, {
    key: "postparse",
    value: function postparse(postparsed) {
      return traits.expandToOne(postparsed, {
        moduleName: moduleName,
        getInner: getInner,
        expandTo: this.fileTypeConfig.tagRawXml
      });
    }
  }, {
    key: "render",
    value: function render(part, options) {
      if (part.module !== moduleName) {
        return null;
      }

      var value = options.scopeManager.getValue(part.value, {
        part: part
      });

      if (value == null) {
        value = options.nullGetter(part);
      }

      if (!value) {
        return {
          value: part.emptyValue || ""
        };
      }

      return {
        value: value
      };
    }
  }, {
    key: "resolve",
    value: function resolve(part, options) {
      if (part.type !== "placeholder" || part.module !== moduleName) {
        return null;
      }

      return options.scopeManager.getValueAsync(part.value, {
        part: part
      }).then(function (value) {
        if (value == null) {
          return options.nullGetter(part);
        }

        return value;
      });
    }
  }]);

  return RawXmlModule;
}();

module.exports = function () {
  return wrapper(new RawXmlModule());
};
},{"../doc-utils":4,"../errors":6,"../module-wrapper":10,"../prefix-matcher":18,"../traits":22}],14:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var wrapper = require("../module-wrapper");

var _require = require("../errors"),
    getScopeCompilationError = _require.getScopeCompilationError;

var _require2 = require("../doc-utils"),
    utf8ToWord = _require2.utf8ToWord,
    hasCorruptCharacters = _require2.hasCorruptCharacters;

var _require3 = require("../errors"),
    throwCorruptCharacters = _require3.throwCorruptCharacters;

var ftprefix = {
  docx: "w",
  pptx: "a"
};

var Render =
/*#__PURE__*/
function () {
  function Render() {
    _classCallCheck(this, Render);

    this.name = "Render";
    this.recordRun = false;
    this.recordedRun = [];
  }

  _createClass(Render, [{
    key: "set",
    value: function set(obj) {
      if (obj.compiled) {
        this.compiled = obj.compiled;
      }

      if (obj.data != null) {
        this.data = obj.data;
      }
    }
  }, {
    key: "getRenderedMap",
    value: function getRenderedMap(mapper) {
      var _this = this;

      return Object.keys(this.compiled).reduce(function (mapper, from) {
        mapper[from] = {
          from: from,
          data: _this.data
        };
        return mapper;
      }, mapper);
    }
  }, {
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      this.parser = docxtemplater.parser;
      this.fileType = docxtemplater.fileType;
      return options;
    }
  }, {
    key: "postparse",
    value: function postparse(postparsed) {
      var _this2 = this;

      var errors = [];
      postparsed.forEach(function (p) {
        if (p.type === "placeholder") {
          var tag = p.value;

          try {
            _this2.parser(tag, {
              tag: p
            });
          } catch (rootError) {
            errors.push(getScopeCompilationError({
              tag: tag,
              rootError: rootError
            }));
          }
        }
      });
      return {
        postparsed: postparsed,
        errors: errors
      };
    }
  }, {
    key: "recordRuns",
    value: function recordRuns(part) {
      if (part.tag === "".concat(ftprefix[this.fileType], ":r")) {
        this.recordRun = false;
        this.recordedRun = [];
      } else if (part.tag === "".concat(ftprefix[this.fileType], ":rPr")) {
        if (part.position === "start") {
          this.recordRun = true;
          this.recordedRun = [part.value];
        }

        if (part.position === "end") {
          this.recordedRun.push(part.value);
          this.recordRun = false;
        }
      } else if (this.recordRun) {
        this.recordedRun.push(part.value);
      }
    }
  }, {
    key: "render",
    value: function render(part, _ref) {
      var scopeManager = _ref.scopeManager,
          linebreaks = _ref.linebreaks,
          nullGetter = _ref.nullGetter;

      if (linebreaks) {
        this.recordRuns(part);
      }

      if (part.type === "placeholder" && !part.module) {
        var value = scopeManager.getValue(part.value, {
          part: part
        });

        if (value == null) {
          value = nullGetter(part);
        }

        if (hasCorruptCharacters(value)) {
          throwCorruptCharacters({
            tag: part.value,
            value: value
          });
        }

        if (typeof value !== "string") {
          value = value.toString();
        }

        if (linebreaks) {
          var p = ftprefix[this.fileType];
          var br = this.fileType === "docx" ? "<w:r><w:br/></w:r>" : "<a:br/>";
          var lines = value.split("\n");
          var runprops = this.recordedRun.join("");
          return {
            value: lines.map(function (line) {
              return utf8ToWord(line);
            }).join("</".concat(p, ":t></").concat(p, ":r>").concat(br, "<").concat(p, ":r>").concat(runprops, "<").concat(p, ":t").concat(this.fileType === "docx" ? ' xml:space="preserve"' : "", ">"))
          };
        }

        return {
          value: utf8ToWord(value)
        };
      }
    }
  }]);

  return Render;
}();

module.exports = function () {
  return wrapper(new Render());
};
},{"../doc-utils":4,"../errors":6,"../module-wrapper":10}],15:[function(require,module,exports){
"use strict";

var wrapper = require("../module-wrapper");

var _require = require("../doc-utils"),
    isTextStart = _require.isTextStart,
    isTextEnd = _require.isTextEnd,
    endsWith = _require.endsWith,
    startsWith = _require.startsWith;

var wTpreserve = '<w:t xml:space="preserve">';
var wTpreservelen = wTpreserve.length;
var wtEnd = "</w:t>";
var wtEndlen = wtEnd.length;

function isWtStart(part) {
  return isTextStart(part) && part.tag === "w:t";
}

function addXMLPreserve(chunk, index) {
  var tag = chunk[index].value;

  if (chunk[index + 1].value === "</w:t>") {
    return tag;
  }

  if (tag.indexOf('xml:space="preserve"') !== -1) {
    return tag;
  }

  return tag.substr(0, tag.length - 1) + ' xml:space="preserve">';
}

function isInsideLoop(meta, chunk) {
  return meta && meta.basePart && chunk.length > 1;
}

var spacePreserve = {
  name: "SpacePreserveModule",
  postparse: function postparse(postparsed, meta) {
    var chunk = [],
        inTextTag = false,
        endLindex = 0,
        lastTextTag = 0;

    function isStartingPlaceHolder(part, chunk) {
      return !endLindex && part.type === "placeholder" && (!part.module || part.module === "loop") && chunk.length > 1;
    }

    var result = postparsed.reduce(function (postparsed, part) {
      if (isWtStart(part)) {
        inTextTag = true;
        lastTextTag = chunk.length;
      }

      if (!inTextTag) {
        postparsed.push(part);
        return postparsed;
      }

      chunk.push(part);

      if (isInsideLoop(meta, chunk)) {
        endLindex = meta.basePart.endLindex;
        chunk[0].value = addXMLPreserve(chunk, 0);
      }

      if (isStartingPlaceHolder(part, chunk)) {
        endLindex = part.endLindex;
        chunk[0].value = addXMLPreserve(chunk, 0);
      }

      if (isTextEnd(part) && part.lIndex > endLindex) {
        if (endLindex !== 0) {
          chunk[lastTextTag].value = addXMLPreserve(chunk, lastTextTag);
        }

        Array.prototype.push.apply(postparsed, chunk);
        chunk = [];
        inTextTag = false;
        endLindex = 0;
        lastTextTag = 0;
      }

      return postparsed;
    }, []);
    Array.prototype.push.apply(result, chunk);
    return result;
  },
  postrender: function postrender(parts) {
    return parts.filter(function (p) {
      return p.length !== 0;
    }).reduce(function (newParts, p, index, parts) {
      if (p.indexOf('<w:t xml:space="preserve"></w:t>') !== -1) {
        p = p.replace(/<w:t xml:space="preserve"><\/w:t>/g, "<w:t/>");
      }

      if (endsWith(p, wTpreserve) && startsWith(parts[index + 1], wtEnd)) {
        p = p.substr(0, p.length - wTpreservelen) + "<w:t/>";
        parts[index + 1] = parts[index + 1].substr(wtEndlen);
      }

      newParts.push(p);
      return newParts;
    }, []);
  }
};

module.exports = function () {
  return wrapper(spacePreserve);
};
},{"../doc-utils":4,"../module-wrapper":10}],16:[function(require,module,exports){
"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("./doc-utils"),
    wordToUtf8 = _require.wordToUtf8,
    concatArrays = _require.concatArrays;

function moduleParse(modules, placeHolderContent, parsed, startOffset, endLindex) {
  var moduleParsed;

  for (var i = 0, l = modules.length; i < l; i++) {
    var _module = modules[i];
    moduleParsed = _module.parse(placeHolderContent);

    if (moduleParsed) {
      moduleParsed.offset = startOffset;
      moduleParsed.endLindex = endLindex;
      moduleParsed.lIndex = endLindex;
      moduleParsed.raw = placeHolderContent;
      parsed.push(moduleParsed);
      return parsed;
    }
  }

  parsed.push({
    type: "placeholder",
    value: placeHolderContent,
    offset: startOffset,
    endLindex: endLindex,
    lIndex: endLindex
  });
  return parsed;
}

var parser = {
  postparse: function postparse(postparsed, modules) {
    function getTraits(traitName, postparsed) {
      return modules.map(function (module) {
        return module.getTraits(traitName, postparsed);
      });
    }

    var errors = [];

    function postparse(postparsed, options) {
      return modules.reduce(function (postparsed, module) {
        var r = module.postparse(postparsed, _objectSpread({}, options, {
          postparse: postparse,
          getTraits: getTraits
        }));

        if (r.errors) {
          errors = concatArrays([errors, r.errors]);
          return r.postparsed;
        }

        return r;
      }, postparsed);
    }

    return {
      postparsed: postparse(postparsed),
      errors: errors
    };
  },
  parse: function parse(lexed, modules) {
    var inPlaceHolder = false;
    var placeHolderContent = "";
    var startOffset;
    var tailParts = [];
    return lexed.reduce(function lexedToParsed(parsed, token) {
      if (token.type === "delimiter") {
        inPlaceHolder = token.position === "start";

        if (token.position === "end") {
          var endLindex = token.lIndex;
          placeHolderContent = wordToUtf8(placeHolderContent);
          parsed = moduleParse(modules, placeHolderContent, parsed, startOffset, endLindex);
          startOffset = null;
          Array.prototype.push.apply(parsed, tailParts);
          tailParts = [];
        }

        if (token.position === "start") {
          tailParts = [];
          startOffset = token.offset;
        }

        placeHolderContent = "";
        return parsed;
      }

      if (!inPlaceHolder) {
        parsed.push(token);
        return parsed;
      }

      if (token.type !== "content" || token.position !== "insidetag") {
        tailParts.push(token);
        return parsed;
      }

      placeHolderContent += token.value;
      return parsed;
    }, []);
  }
};
module.exports = parser;
},{"./doc-utils":4}],17:[function(require,module,exports){
"use strict";

function postrender(parts, options) {
  for (var i = 0, l = options.modules.length; i < l; i++) {
    var _module = options.modules[i];
    parts = _module.postrender(parts, options);
  }

  return parts.join("");
}

module.exports = postrender;
},{}],18:[function(require,module,exports){
"use strict";

function match(condition, placeHolderContent) {
  if (typeof condition === "string") {
    return placeHolderContent.substr(0, condition.length) === condition;
  }

  if (condition instanceof RegExp) {
    return condition.test(placeHolderContent);
  }
}

function getValue(condition, placeHolderContent) {
  if (typeof condition === "string") {
    return placeHolderContent.substr(condition.length);
  }

  if (condition instanceof RegExp) {
    return placeHolderContent.match(condition)[1];
  }
}

function getValues(condition, placeHolderContent) {
  if (condition instanceof RegExp) {
    return placeHolderContent.match(condition);
  }
}

module.exports = {
  match: match,
  getValue: getValue,
  getValues: getValues
};
},{}],19:[function(require,module,exports){
"use strict";

var _require = require("./doc-utils"),
    concatArrays = _require.concatArrays;

var _require2 = require("./errors"),
    throwUnimplementedTagType = _require2.throwUnimplementedTagType;

function moduleRender(part, options) {
  var moduleRendered;

  for (var i = 0, l = options.modules.length; i < l; i++) {
    var _module = options.modules[i];
    moduleRendered = _module.render(part, options);

    if (moduleRendered) {
      return moduleRendered;
    }
  }

  return false;
}

function render(options) {
  var baseNullGetter = options.baseNullGetter;
  var compiled = options.compiled,
      scopeManager = options.scopeManager;

  options.nullGetter = function (part, sm) {
    return baseNullGetter(part, sm || scopeManager);
  };

  var errors = [];
  var parts = compiled.map(function (part) {
    var moduleRendered = moduleRender(part, options);

    if (moduleRendered) {
      if (moduleRendered.errors) {
        errors = concatArrays([errors, moduleRendered.errors]);
      }

      return moduleRendered.value;
    }

    if (part.type === "content" || part.type === "tag") {
      return part.value;
    }

    throwUnimplementedTagType(part);
  });
  return {
    errors: errors,
    parts: parts
  };
}

module.exports = render;
},{"./doc-utils":4,"./errors":6}],20:[function(require,module,exports){
"use strict";

function moduleResolve(part, options) {
  var moduleResolved;

  for (var i = 0, l = options.modules.length; i < l; i++) {
    var _module = options.modules[i];
    moduleResolved = _module.resolve(part, options);

    if (moduleResolved) {
      return moduleResolved;
    }
  }

  return false;
}

function resolve(options) {
  var resolved = [];
  var baseNullGetter = options.baseNullGetter;
  var compiled = options.compiled,
      scopeManager = options.scopeManager;

  options.nullGetter = function (part, sm) {
    return baseNullGetter(part, sm || scopeManager);
  };

  options.resolved = resolved;
  var errors = [];
  return Promise.all(compiled.map(function (part) {
    var moduleResolved = moduleResolve(part, options);

    if (moduleResolved) {
      return moduleResolved.then(function (value) {
        resolved.push({
          tag: part.value,
          value: value,
          lIndex: part.lIndex
        });
      });
    }

    if (part.type === "placeholder") {
      return scopeManager.getValueAsync(part.value, {
        part: part
      }).then(function (value) {
        if (value == null) {
          value = options.nullGetter(part);
        }

        resolved.push({
          tag: part.value,
          value: value,
          lIndex: part.lIndex
        });
        return value;
      });
    }

    return;
  }).filter(function (a) {
    return a;
  })).then(function () {
    return {
      errors: errors,
      resolved: resolved
    };
  });
}

module.exports = resolve;
},{}],21:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require("./errors"),
    getScopeParserExecutionError = _require.getScopeParserExecutionError;

function find(list, fn) {
  var length = list.length >>> 0;
  var value;

  for (var i = 0; i < length; i++) {
    value = list[i];

    if (fn.call(this, value, i, list)) {
      return value;
    }
  }

  return undefined;
}

function _getValue(tag, meta, num) {
  var _this = this;

  this.num = num;
  var scope = this.scopeList[this.num];

  if (this.resolved) {
    var w = this.resolved;
    this.scopePath.forEach(function (p, index) {
      var lIndex = _this.scopeLindex[index];
      w = find(w, function (r) {
        return r.lIndex === lIndex;
      });
      w = w.value[_this.scopePathItem[index]];
    });
    return find(w, function (r) {
      return meta.part.lIndex === r.lIndex;
    }).value;
  } // search in the scopes (in reverse order) and keep the first defined value


  var result;
  var parser = this.parser(tag, {
    scopePath: this.scopePath
  });

  try {
    result = parser.get(scope, this.getContext(meta));
  } catch (error) {
    throw getScopeParserExecutionError({
      tag: tag,
      scope: scope,
      error: error
    });
  }

  if (result == null && this.num > 0) {
    return _getValue.call(this, tag, meta, num - 1);
  }

  return result;
}

function _getValueAsync(tag, meta, num) {
  var _this2 = this;

  this.num = num;
  var scope = this.scopeList[this.num]; // search in the scopes (in reverse order) and keep the first defined value

  var parser = this.parser(tag, {
    scopePath: this.scopePath
  });
  return Promise.resolve(parser.get(scope, this.getContext(meta))).catch(function (error) {
    throw getScopeParserExecutionError({
      tag: tag,
      scope: scope,
      error: error
    });
  }).then(function (result) {
    if (result == null && num > 0) {
      return _getValueAsync.call(_this2, tag, meta, num - 1);
    }

    return result;
  });
} // This class responsibility is to manage the scope


var ScopeManager =
/*#__PURE__*/
function () {
  function ScopeManager(options) {
    _classCallCheck(this, ScopeManager);

    this.scopePath = options.scopePath;
    this.scopePathItem = options.scopePathItem;
    this.scopeList = options.scopeList;
    this.scopeLindex = options.scopeLindex;
    this.parser = options.parser;
    this.resolved = options.resolved;
  }

  _createClass(ScopeManager, [{
    key: "loopOver",
    value: function loopOver(tag, callback, inverted, meta) {
      inverted = inverted || false;
      return this.loopOverValue(this.getValue(tag, meta), callback, inverted);
    }
  }, {
    key: "functorIfInverted",
    value: function functorIfInverted(inverted, functor, value, i) {
      if (inverted) {
        functor(value, i);
      }

      return inverted;
    }
  }, {
    key: "isValueFalsy",
    value: function isValueFalsy(value, type) {
      return value == null || !value || type === "[object Array]" && value.length === 0;
    }
  }, {
    key: "loopOverValue",
    value: function loopOverValue(value, functor, inverted) {
      if (this.resolved) {
        inverted = false;
      }

      var type = Object.prototype.toString.call(value);
      var currentValue = this.scopeList[this.num];

      if (this.isValueFalsy(value, type)) {
        return this.functorIfInverted(inverted, functor, currentValue, 0);
      }

      if (type === "[object Array]") {
        for (var i = 0, scope; i < value.length; i++) {
          scope = value[i];
          this.functorIfInverted(!inverted, functor, scope, i);
        }

        return true;
      }

      if (type === "[object Object]") {
        return this.functorIfInverted(!inverted, functor, value, 0);
      }

      return this.functorIfInverted(!inverted, functor, currentValue, 0);
    }
  }, {
    key: "getValue",
    value: function getValue(tag, meta) {
      var num = this.scopeList.length - 1;
      return _getValue.call(this, tag, meta, num);
    }
  }, {
    key: "getValueAsync",
    value: function getValueAsync(tag, meta) {
      var num = this.scopeList.length - 1;
      return _getValueAsync.call(this, tag, meta, num);
    }
  }, {
    key: "getContext",
    value: function getContext(meta) {
      return {
        num: this.num,
        meta: meta,
        scopeList: this.scopeList,
        resolved: this.resolved,
        scopePath: this.scopePath,
        scopePathItem: this.scopePathItem
      };
    }
  }, {
    key: "createSubScopeManager",
    value: function createSubScopeManager(scope, tag, i, part) {
      return new ScopeManager({
        resolved: this.resolved,
        parser: this.parser,
        scopeList: this.scopeList.concat(scope),
        scopePath: this.scopePath.concat(tag),
        scopePathItem: this.scopePathItem.concat(i),
        scopeLindex: this.scopeLindex.concat(part.lIndex)
      });
    }
  }]);

  return ScopeManager;
}();

module.exports = function (options) {
  options.scopePath = [];
  options.scopePathItem = [];
  options.scopeLindex = [];
  options.scopeList = [options.tags];
  return new ScopeManager(options);
};
},{"./errors":6}],22:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require("./doc-utils"),
    getRightOrNull = _require.getRightOrNull,
    getRight = _require.getRight,
    getLeft = _require.getLeft,
    getLeftOrNull = _require.getLeftOrNull,
    concatArrays = _require.concatArrays,
    chunkBy = _require.chunkBy,
    isTagStart = _require.isTagStart,
    isTagEnd = _require.isTagEnd,
    isContent = _require.isContent,
    last = _require.last;

var _require2 = require("./errors"),
    XTTemplateError = _require2.XTTemplateError,
    throwRawTagNotInParagraph = _require2.throwRawTagNotInParagraph,
    getLoopPositionProducesInvalidXMLError = _require2.getLoopPositionProducesInvalidXMLError;

function lastTagIsOpenTag(array, tag) {
  if (array.length === 0) {
    return false;
  }

  var lastTag = array[array.length - 1];
  var innerLastTag = lastTag.tag.substr(1);
  var innerCurrentTag = tag.substr(2, tag.length - 3);
  return innerLastTag.indexOf(innerCurrentTag) === 0;
}

function addTag(array, tag) {
  array.push({
    tag: tag
  });
  return array;
}

function getListXmlElements(parts) {
  /*
  get the different closing and opening tags between two texts (doesn't take into account tags that are opened then closed (those that are closed then opened are returned)):
  returns:[{"tag":"</w:r>","offset":13},{"tag":"</w:p>","offset":265},{"tag":"</w:tc>","offset":271},{"tag":"<w:tc>","offset":828},{"tag":"<w:p>","offset":883},{"tag":"<w:r>","offset":1483}]
  */
  var tags = parts.filter(function (part) {
    return part.type === "tag";
  });
  var result = [];

  for (var i = 0, tag; i < tags.length; i++) {
    tag = tags[i].value; // closing tag

    if (tag[1] === "/") {
      if (lastTagIsOpenTag(result, tag)) {
        result.pop();
      } else {
        result = addTag(result, tag);
      }
    } else if (tag[tag.length - 2] !== "/") {
      result = addTag(result, tag);
    }
  }

  return result;
}

function has(name, xmlElements) {
  for (var i = 0; i < xmlElements.length; i++) {
    var xmlElement = xmlElements[i];

    if (xmlElement.tag.indexOf("<".concat(name)) === 0) {
      return true;
    }
  }

  return false;
}

function getExpandToDefault(postparsed, pair, expandTags) {
  var parts = postparsed.slice(pair[0].offset, pair[1].offset);
  var xmlElements = getListXmlElements(parts);
  var closingTagCount = xmlElements.filter(function (xmlElement) {
    return xmlElement.tag[1] === "/";
  }).length;
  var startingTagCount = xmlElements.filter(function (xmlElement) {
    var tag = xmlElement.tag;
    return tag[1] !== "/" && tag[tag.length - 2] !== "/";
  }).length;

  if (closingTagCount !== startingTagCount) {
    return {
      error: getLoopPositionProducesInvalidXMLError({
        tag: pair[0].part.value
      })
    };
  }

  var _loop = function _loop(i, len) {
    var _expandTags$i = expandTags[i],
        contains = _expandTags$i.contains,
        expand = _expandTags$i.expand,
        onlyTextInTag = _expandTags$i.onlyTextInTag;

    if (has(contains, xmlElements)) {
      if (onlyTextInTag) {
        var left = getLeftOrNull(postparsed, contains, pair[0].offset);
        var right = getRightOrNull(postparsed, contains, pair[1].offset);

        if (left === null || right === null) {
          return "continue";
        }

        var chunks = chunkBy(postparsed.slice(left, right), function (p) {
          if (isTagStart(contains, p)) {
            return "start";
          }

          if (isTagEnd(contains, p)) {
            return "end";
          }

          return null;
        });

        if (chunks.length <= 2) {
          return "continue";
        }

        var firstChunk = chunks[0];
        var lastChunk = last(chunks);
        var firstContent = firstChunk.filter(isContent);
        var lastContent = lastChunk.filter(isContent);

        if (firstContent.length !== 1 || lastContent.length !== 1) {
          return "continue";
        }
      }

      return {
        v: {
          value: expand
        }
      };
    }
  };

  for (var i = 0, len = expandTags.length; i < len; i++) {
    var _ret = _loop(i, len);

    switch (_ret) {
      case "continue":
        continue;

      default:
        if (_typeof(_ret) === "object") return _ret.v;
    }
  }

  return false;
}

function expandOne(part, postparsed, options) {
  var expandTo = part.expandTo || options.expandTo;
  var index = postparsed.indexOf(part);

  if (!expandTo) {
    return postparsed;
  }

  var right, left;

  try {
    right = getRight(postparsed, expandTo, index);
    left = getLeft(postparsed, expandTo, index);
  } catch (rootError) {
    if (rootError instanceof XTTemplateError) {
      throwRawTagNotInParagraph({
        part: part,
        rootError: rootError,
        postparsed: postparsed,
        expandTo: expandTo,
        index: index
      });
    }

    throw rootError;
  }

  var leftParts = postparsed.slice(left, index);
  var rightParts = postparsed.slice(index + 1, right + 1);
  var inner = options.getInner({
    index: index,
    part: part,
    leftParts: leftParts,
    rightParts: rightParts,
    left: left,
    right: right,
    postparsed: postparsed
  });

  if (!inner.length) {
    inner.expanded = [leftParts, rightParts];
    inner = [inner];
  }

  return concatArrays([postparsed.slice(0, left), inner, postparsed.slice(right + 1)]);
}

function expandToOne(postparsed, options) {
  var errors = [];

  if (postparsed.errors) {
    errors = postparsed.errors;
    postparsed = postparsed.postparsed;
  }

  var expandToElements = postparsed.reduce(function (elements, part) {
    if (part.type === "placeholder" && part.module === options.moduleName) {
      elements.push(part);
    }

    return elements;
  }, []);
  expandToElements.forEach(function (part) {
    try {
      postparsed = expandOne(part, postparsed, options);
    } catch (error) {
      if (error instanceof XTTemplateError) {
        errors.push(error);
      } else {
        throw error;
      }
    }
  });
  return {
    postparsed: postparsed,
    errors: errors
  };
}

module.exports = {
  expandToOne: expandToOne,
  getExpandToDefault: getExpandToDefault
};
},{"./doc-utils":4,"./errors":6}],23:[function(require,module,exports){
"use strict"; // res class responsibility is to parse the XML.

var _require = require("./doc-utils"),
    pregMatchAll = _require.pregMatchAll;

function handleRecursiveCase(res) {
  /*
   * Because xmlTemplater is recursive (meaning it can call it self), we need to handle special cases where the XML is not valid:
   * For example with res string "I am</w:t></w:r></w:p><w:p><w:r><w:t>sleeping",
   *   - we need to match also the string that is inside an implicit <w:t> (that's the role of replacerUnshift) (in res case 'I am')
   *   - we need to match the string that is at the right of a <w:t> (that's the role of replacerPush) (in res case 'sleeping')
   * the test: describe "scope calculation" it "should compute the scope between 2 <w:t>" makes sure that res part of code works
   * It should even work if they is no XML at all, for example if the code is just "I am sleeping", in res case however, they should only be one match
   */
  function replacerUnshift() {
    var pn = {
      array: Array.prototype.slice.call(arguments)
    };
    pn.array.shift();
    var match = pn.array[0] + pn.array[1]; // add match so that pn[0] = whole match, pn[1]= first parenthesis,...

    pn.array.unshift(match);
    pn.array.pop();
    var offset = pn.array.pop();
    pn.offset = offset;
    pn.first = true; // add at the beginning

    res.matches.unshift(pn);
  }

  if (res.content.indexOf("<") === -1 && res.content.indexOf(">") === -1) {
    res.content.replace(/^()([^<>]*)$/, replacerUnshift);
  }

  var r = new RegExp("^()([^<]+)</(?:".concat(res.tagsXmlArrayJoined, ")>"));
  res.content.replace(r, replacerUnshift);

  function replacerPush() {
    var pn = {
      array: Array.prototype.slice.call(arguments)
    };
    pn.array.pop();
    var offset = pn.array.pop();
    pn.offset = offset;
    pn.last = true;

    if (pn.array[0].indexOf("/>") !== -1) {
      return;
    } // add at the end


    res.matches.push(pn);
  }

  r = new RegExp("(<(?:".concat(res.tagsXmlArrayJoined, ")[^>]*>)([^>]+)$"));
  res.content.replace(r, replacerPush);
  return res;
}

module.exports = function xmlMatcher(content, tagsXmlArray) {
  var res = {};
  res.content = content;
  res.tagsXmlArray = tagsXmlArray;
  res.tagsXmlArrayJoined = res.tagsXmlArray.join("|");
  var regexp = new RegExp("(?:(<(?:".concat(res.tagsXmlArrayJoined, ")[^>]*>)([^<>]*)</(?:").concat(res.tagsXmlArrayJoined, ")>)|(<(?:").concat(res.tagsXmlArrayJoined, ")[^>]*/>)"), "g");
  res.matches = pregMatchAll(regexp, res.content);
  return handleRecursiveCase(res);
};
},{"./doc-utils":4}],24:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require("./doc-utils"),
    wordToUtf8 = _require.wordToUtf8,
    convertSpaces = _require.convertSpaces,
    defaults = _require.defaults;

var createScope = require("./scope-manager");

var xmlMatcher = require("./xml-matcher");

var _require2 = require("./errors"),
    throwMultiError = _require2.throwMultiError,
    throwContentMustBeString = _require2.throwContentMustBeString;

var Lexer = require("./lexer");

var Parser = require("./parser.js");

var _render = require("./render.js");

var postrender = require("./postrender.js");

var resolve = require("./resolve.js");

function _getFullText(content, tagsXmlArray) {
  var matcher = xmlMatcher(content, tagsXmlArray);
  var result = matcher.matches.map(function (match) {
    return match.array[2];
  });
  return wordToUtf8(convertSpaces(result.join("")));
}

module.exports =
/*#__PURE__*/
function () {
  function XmlTemplater(content, options) {
    _classCallCheck(this, XmlTemplater);

    this.filePath = options.filePath;
    this.modules = options.modules;
    this.fileTypeConfig = options.fileTypeConfig;
    Object.keys(defaults).map(function (key) {
      this[key] = options[key] != null ? options[key] : defaults[key];
    }, this);
    this.setModules({
      inspect: {
        filePath: this.filePath
      }
    });
    this.load(content);
  }

  _createClass(XmlTemplater, [{
    key: "load",
    value: function load(content) {
      if (typeof content !== "string") {
        throwContentMustBeString(_typeof(content));
      }

      this.content = content;
    }
  }, {
    key: "setTags",
    value: function setTags(tags) {
      this.tags = tags != null ? tags : {};
      this.scopeManager = createScope({
        tags: this.tags,
        parser: this.parser
      });
      return this;
    }
  }, {
    key: "resolveTags",
    value: function resolveTags(tags) {
      var _this = this;

      this.tags = tags != null ? tags : {};
      this.scopeManager = createScope({
        tags: this.tags,
        parser: this.parser
      });
      var options = this.getOptions();
      options.scopeManager = createScope(options);
      options.resolve = resolve;
      return resolve(options).then(function (_ref) {
        var resolved = _ref.resolved;
        return Promise.all(resolved.map(function (r) {
          return Promise.resolve(r);
        })).then(function (resolved) {
          _this.setModules({
            inspect: {
              resolved: resolved
            }
          });

          return _this.resolved = resolved;
        });
      });
    }
  }, {
    key: "getFullText",
    value: function getFullText() {
      return _getFullText(this.content, this.fileTypeConfig.tagsXmlTextArray);
    }
  }, {
    key: "setModules",
    value: function setModules(obj) {
      this.modules.forEach(function (module) {
        module.set(obj);
      });
    }
  }, {
    key: "parse",
    value: function parse() {
      var allErrors = [];
      this.xmllexed = Lexer.xmlparse(this.content, {
        text: this.fileTypeConfig.tagsXmlTextArray,
        other: this.fileTypeConfig.tagsXmlLexedArray
      });
      this.setModules({
        inspect: {
          xmllexed: this.xmllexed
        }
      });

      var _Lexer$parse = Lexer.parse(this.xmllexed, this.delimiters),
          lexed = _Lexer$parse.lexed,
          lexerErrors = _Lexer$parse.errors;

      allErrors = allErrors.concat(lexerErrors);
      this.lexed = lexed;
      this.setModules({
        inspect: {
          lexed: this.lexed
        }
      });
      this.parsed = Parser.parse(this.lexed, this.modules);
      this.setModules({
        inspect: {
          parsed: this.parsed
        }
      });

      var _Parser$postparse = Parser.postparse(this.parsed, this.modules),
          postparsed = _Parser$postparse.postparsed,
          postparsedErrors = _Parser$postparse.errors;

      this.postparsed = postparsed;
      this.setModules({
        inspect: {
          postparsed: this.postparsed
        }
      });
      allErrors = allErrors.concat(postparsedErrors);
      this.errorChecker(allErrors);
      return this;
    }
  }, {
    key: "errorChecker",
    value: function errorChecker(errors) {
      var _this2 = this;

      if (errors.length) {
        this.modules.forEach(function (module) {
          errors = module.errorsTransformer(errors);
        });
        errors.forEach(function (error) {
          error.properties.file = _this2.filePath;
        });
        throwMultiError(errors);
      }
    }
  }, {
    key: "baseNullGetter",
    value: function baseNullGetter(part, sm) {
      var _this3 = this;

      var value = this.modules.reduce(function (value, module) {
        if (value != null) {
          return value;
        }

        return module.nullGetter(part, sm, _this3);
      }, null);

      if (value != null) {
        return value;
      }

      return this.nullGetter(part, sm);
    }
  }, {
    key: "getOptions",
    value: function getOptions() {
      return {
        compiled: this.postparsed,
        tags: this.tags,
        modules: this.modules,
        parser: this.parser,
        baseNullGetter: this.baseNullGetter.bind(this),
        filePath: this.filePath,
        linebreaks: this.linebreaks
      };
    }
  }, {
    key: "render",
    value: function render(to) {
      this.filePath = to;
      var options = this.getOptions();
      options.resolved = this.resolved;
      options.scopeManager = createScope(options);
      options.render = _render;

      var _render2 = _render(options),
          errors = _render2.errors,
          parts = _render2.parts;

      this.errorChecker(errors);
      this.content = postrender(parts, options);
      this.setModules({
        inspect: {
          content: this.content
        }
      });
      return this;
    }
  }]);

  return XmlTemplater;
}();
},{"./doc-utils":4,"./errors":6,"./lexer":8,"./parser.js":16,"./postrender.js":17,"./render.js":19,"./resolve.js":20,"./scope-manager":21,"./xml-matcher":23}],25:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
//}

},{"./dom":26,"./sax":27}],26:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{}],27:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}]},{},[])("/js/index.js")
});

/**
 * Minified by jsDelivr using Terser v5.37.0.
 * Original file: /npm/docxtemplater-image-module-free@1.1.1/build/imagemodule.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).ImageModule=t()}}((function(){return function t(e,r,n){function o(i,s){if(!r[i]){if(!e[i]){var u="function"==typeof require&&require;if(!s&&u)return u(i,!0);if(a)return a(i,!0);var l=new Error("Cannot find module '"+i+"'");throw l.code="MODULE_NOT_FOUND",l}var c=r[i]={exports:{}};e[i][0].call(c.exports,(function(t){return o(e[i][1][t]||t)}),c,c.exports,t,e,r,n)}return r[i].exports}for(var a="function"==typeof require&&require,i=0;i<n.length;i++)o(n[i]);return o}({"/js/index.js":[function(t,e,r){"use strict";var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();var a=t("./templates"),i=t("docxtemplater").DocUtils,s=t("xmldom").DOMParser;var u=t("./imgManager"),l="open-xml-templating/docxtemplater-image-module";function c(t){return t.part}function p(t){var e=t.part,r=t.left,n=t.right,o=t.postparsed.slice(r+1,n).reduce((function(t,e){return t+e.value}),""),a=(new s).parseFromString("<xml>"+o+"</xml>");e.offset={x:0,y:0},e.ext={cx:0,cy:0};var i=a.getElementsByTagName("a:off"),u=a.getElementsByTagName("a:ext");return u.length>0&&(e.ext.cx=parseInt(u[u.length-1].getAttribute("cx"),10),e.ext.cy=parseInt(u[u.length-1].getAttribute("cy"),10)),i.length>0&&(e.offset.x=parseInt(i[i.length-1].getAttribute("x"),10),e.offset.y=parseInt(i[i.length-1].getAttribute("y"),10)),e}var f=function(){function t(e){if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.name="ImageModule",this.options=e||{},this.imgManagers={},null==this.options.centered&&(this.options.centered=!1),null==this.options.getImage)throw new Error("You should pass getImage");if(null==this.options.getSize)throw new Error("You should pass getSize");this.imageNumber=1}return o(t,[{key:"optionsTransformer",value:function(t,e){var r=e.zip.file(/\.xml\.rels/).concat(e.zip.file(/\[Content_Types\].xml/)).map((function(t){return t.name}));return this.fileTypeConfig=e.fileTypeConfig,this.fileType=e.fileType,this.zip=e.zip,t.xmlFileNames=t.xmlFileNames.concat(r),t}},{key:"set",value:function(t){t.zip&&(this.zip=t.zip),t.xmlDocuments&&(this.xmlDocuments=t.xmlDocuments)}},{key:"parse",value:function(t){var e=l,r="placeholder";return this.options.setParser?this.options.setParser(t):"%%"===t.substring(0,2)?{type:r,value:t.substr(2),module:e,centered:!0}:"%"===t.substring(0,1)?{type:r,value:t.substr(1),module:e,centered:!1}:null}},{key:"postparse",value:function(t){var e=void 0,r=void 0;return"pptx"===this.fileType?(e="p:sp",r=p):(e=this.options.centered?"w:p":"w:t",r=c),i.traits.expandToOne(t,{moduleName:l,getInner:r,expandTo:e})}},{key:"render",value:function(t,e){if("placeholder"===!t.type||t.module!==l)return null;var r=e.scopeManager.getValue(t.value,{part:t});if(!r)return{value:this.fileTypeConfig.tagTextXml};if("object"===(void 0===r?"undefined":n(r)))return this.getRenderedPart(t,r.rId,r.sizePixel);var o=new u(this.zip,e.filePath,this.xmlDocuments,this.fileType),a=this.options.getImage(r,t.value),i=o.addImageRels(this.getNextImageName(),a),s=this.options.getSize(a,r,t.value);return this.getRenderedPart(t,i,s)}},{key:"resolve",value:function(t,e){var r=this,n=new u(this.zip,e.filePath,this.xmlDocuments,this.fileType);if("placeholder"===!t.type||t.module!==l)return null;var o=e.scopeManager.getValue(t.value,{part:t});return o?new Promise((function(e){e(r.options.getImage(o,t.value))})).then((function(e){var a=n.addImageRels(r.getNextImageName(),e);return new Promise((function(n){n(r.options.getSize(e,o,t.value))})).then((function(t){return{rId:a,sizePixel:t}}))})):{value:this.fileTypeConfig.tagTextXml}}},{key:"getRenderedPart",value:function(t,e,r){if((n=e)!=n)throw new Error("rId is NaN, aborting");var n,o=[i.convertPixelsToEmus(r[0]),i.convertPixelsToEmus(r[1])],a=this.options.centered||t.centered;return{value:"pptx"===this.fileType?this.getRenderedPartPptx(t,e,o,a):this.getRenderedPartDocx(e,o,a)}}},{key:"getRenderedPartPptx",value:function(t,e,r,n){var o={x:parseInt(t.offset.x,10),y:parseInt(t.offset.y,10)},i=parseInt(t.ext.cx,10)||1,s=parseInt(t.ext.cy,10)||1,u=parseInt(r[0],10)||1,l=parseInt(r[1],10)||1;return n&&(o.x=Math.round(o.x+i/2-u/2),o.y=Math.round(o.y+s/2-l/2)),a.getPptxImageXml(e,[u,l],o)}},{key:"getRenderedPartDocx",value:function(t,e,r){return r?a.getImageXmlCentered(t,e):a.getImageXml(t,e)}},{key:"getNextImageName",value:function(){var t="image_generated_"+this.imageNumber+".png";return this.imageNumber++,t}}]),t}();e.exports=f},{"./imgManager":2,"./templates":3,docxtemplater:5,xmldom:25}],1:[function(t,e,r){"use strict";var n=t("docxtemplater").DocUtils;n.convertPixelsToEmus=function(t){return Math.round(9525*t)},e.exports=n},{docxtemplater:5}],2:[function(t,e,r){"use strict";var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();var o=t("./docUtils"),a=/[^.]+\.([^.]+)/,i={getPrefix:function(t){return"docx"===t?"word":"ppt"},getFileTypeName:function(t){return"docx"===t?"document":"presentation"},getRelsFileName:function(t){return t.replace(/^.*?([a-zA-Z0-9]+)\.xml$/,"$1")+".xml.rels"},getRelsFilePath:function(t,e){return("pptx"===e?"ppt/slides":"word")+"/_rels/"+i.getRelsFileName(t)}};e.exports=function(){function t(e,r,n,o){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.fileName=r,this.prefix=i.getPrefix(o),this.zip=e,this.xmlDocuments=n,this.fileTypeName=i.getFileTypeName(o),this.mediaPrefix="pptx"===o?"../media":"media";var a=i.getRelsFilePath(r,o);this.relsDoc=n[a]||this.createEmptyRelsDoc(n,a)}return n(t,[{key:"createEmptyRelsDoc",value:function(t,e){var r=this.prefix+"/_rels/"+this.fileTypeName+".xml.rels",n=t[r];if(!n){var a=new Error("Could not copy from empty relsdoc");throw a.properties={mainRels:r,relsFileName:e,files:Object.keys(this.zip.files)},a}for(var i=o.str2xml(o.xml2str(n)),s=i.getElementsByTagName("Relationships")[0],u=s.getElementsByTagName("Relationship"),l=0,c=u.length;l<c;l++)s.removeChild(u[l]);return t[e]=i,i}},{key:"loadImageRels",value:function(){var t=this.relsDoc.getElementsByTagName("Relationship");return Array.prototype.reduce.call(t,(function(t,e){var r=e.getAttribute("Id");return/^rId[0-9]+$/.test(r)?Math.max(t,parseInt(r.substr(3),10)):t}),0)}},{key:"addExtensionRels",value:function(t,e){var r=this.xmlDocuments["[Content_Types].xml"],n=r.getElementsByTagName("Default");if(!Array.prototype.some.call(n,(function(t){return t.getAttribute("Extension")===e}))){var o=r.getElementsByTagName("Types")[0],a=r.createElement("Default");a.namespaceURI=null,a.setAttribute("ContentType",t),a.setAttribute("Extension",e),o.appendChild(a)}}},{key:"addImageRels",value:function(t,e,r){null==r&&(r=0);var n=0===r?t:t+"("+r+")",o=this.prefix+"/media/"+n;if(null!=this.zip.files[o])return this.addImageRels(t,e,r+1);var i={name:o,data:e,options:{binary:!0}};this.zip.file(i.name,i.data,i.options);var s=n.replace(a,"$1");this.addExtensionRels("image/"+s,s);var u=this.relsDoc.getElementsByTagName("Relationships")[0],l=this.relsDoc.createElement("Relationship");l.namespaceURI=null;var c=this.loadImageRels()+1;return l.setAttribute("Id","rId"+c),l.setAttribute("Type","http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"),l.setAttribute("Target",this.mediaPrefix+"/"+n),u.appendChild(l),c}}]),t}()},{"./docUtils":1}],3:[function(t,e,r){"use strict";e.exports={getImageXml:function(t,e){return('<w:drawing>\n\t\t<wp:inline distT="0" distB="0" distL="0" distR="0">\n\t\t\t<wp:extent cx="'+e[0]+'" cy="'+e[1]+'"/>\n\t\t\t<wp:effectExtent l="0" t="0" r="0" b="0"/>\n\t\t\t<wp:docPr id="2" name="Image 2" descr="image"/>\n\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t\t<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>\n\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">\n\t\t\t\t<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">\n\t\t\t\t\t<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">\n\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id="0" name="Picture 1" descr="image"/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed="rId'+t+'">\n\t\t\t\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t\t\t\t<a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">\n\t\t\t\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>\n\t\t\t\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t\t\t\t</a:extLst>\n\t\t\t\t\t\t\t</a:blip>\n\t\t\t\t\t\t\t<a:srcRect/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t<pic:spPr bwMode="auto">\n\t\t\t\t\t\t\t<a:xfrm>\n\t\t\t\t\t\t\t\t<a:off x="0" y="0"/>\n\t\t\t\t\t\t\t\t<a:ext cx="'+e[0]+'" cy="'+e[1]+'"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst="rect">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln>\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t</pic:pic>\n\t\t\t\t</a:graphicData>\n\t\t\t</a:graphic>\n\t\t</wp:inline>\n\t</w:drawing>\n\t\t').replace(/\t|\n/g,"")},getImageXmlCentered:function(t,e){return('<w:p>\n\t\t\t<w:pPr>\n\t\t\t\t<w:jc w:val="center"/>\n\t\t\t</w:pPr>\n\t\t\t<w:r>\n\t\t\t\t<w:rPr/>\n\t\t\t\t<w:drawing>\n\t\t\t\t\t<wp:inline distT="0" distB="0" distL="0" distR="0">\n\t\t\t\t\t<wp:extent cx="'+e[0]+'" cy="'+e[1]+'"/>\n\t\t\t\t\t<wp:docPr id="0" name="Picture" descr=""/>\n\t\t\t\t\t<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">\n\t\t\t\t\t\t<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">\n\t\t\t\t\t\t<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">\n\t\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id="0" name="Picture" descr=""/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed="rId'+t+'"/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t\t<pic:spPr bwMode="auto">\n\t\t\t\t\t\t\t<a:xfrm>\n\t\t\t\t\t\t\t\t<a:off x="0" y="0"/>\n\t\t\t\t\t\t\t\t<a:ext cx="'+e[0]+'" cy="'+e[1]+'"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst="rect">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln w="9525">\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t\t<a:miter lim="800000"/>\n\t\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t\t</pic:pic>\n\t\t\t\t\t\t</a:graphicData>\n\t\t\t\t\t</a:graphic>\n\t\t\t\t\t</wp:inline>\n\t\t\t\t</w:drawing>\n\t\t\t</w:r>\n\t\t</w:p>\n\t\t').replace(/\t|\n/g,"")},getPptxImageXml:function(t,e,r){return('<p:pic>\n\t\t\t<p:nvPicPr>\n\t\t\t\t<p:cNvPr id="6" name="Picture 2"/>\n\t\t\t\t<p:cNvPicPr>\n\t\t\t\t\t<a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>\n\t\t\t\t</p:cNvPicPr>\n\t\t\t\t<p:nvPr/>\n\t\t\t</p:nvPicPr>\n\t\t\t<p:blipFill>\n\t\t\t\t<a:blip r:embed="rId'+t+'" cstate="print">\n\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t<a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">\n\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>\n\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t</a:extLst>\n\t\t\t\t</a:blip>\n\t\t\t\t<a:srcRect/>\n\t\t\t\t<a:stretch>\n\t\t\t\t\t<a:fillRect/>\n\t\t\t\t</a:stretch>\n\t\t\t</p:blipFill>\n\t\t\t<p:spPr bwMode="auto">\n\t\t\t\t<a:xfrm>\n\t\t\t\t\t<a:off x="'+r.x+'" y="'+r.y+'"/>\n\t\t\t\t\t<a:ext cx="'+e[0]+'" cy="'+e[1]+'"/>\n\t\t\t\t</a:xfrm>\n\t\t\t\t<a:prstGeom prst="rect">\n\t\t\t\t\t<a:avLst/>\n\t\t\t\t</a:prstGeom>\n\t\t\t\t<a:noFill/>\n\t\t\t\t<a:ln>\n\t\t\t\t\t<a:noFill/>\n\t\t\t\t</a:ln>\n\t\t\t\t<a:effectLst/>\n\t\t\t\t<a:extLst>\n\t\t\t\t\t<a:ext uri="{909E8E84-426E-40DD-AFC4-6F175D3DCCD1}">\n\t\t\t\t\t\t<a14:hiddenFill xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val="accent1"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t</a14:hiddenFill>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri="{91240B29-F687-4F45-9708-019B960494DF}">\n\t\t\t\t\t\t<a14:hiddenLine xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" w="9525">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val="tx1"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t\t<a:miter lim="800000"/>\n\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t</a14:hiddenLine>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri="{AF507438-7753-43E0-B8FC-AC1667EBCBE1}">\n\t\t\t\t\t\t<a14:hiddenEffects xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main">\n\t\t\t\t\t\t\t<a:effectLst>\n\t\t\t\t\t\t\t\t<a:outerShdw dist="35921" dir="2700000" algn="ctr" rotWithShape="0">\n\t\t\t\t\t\t\t\t\t<a:schemeClr val="bg2"/>\n\t\t\t\t\t\t\t\t</a:outerShdw>\n\t\t\t\t\t\t\t</a:effectLst>\n\t\t\t\t\t\t</a14:hiddenEffects>\n\t\t\t\t\t</a:ext>\n\t\t\t\t</a:extLst>\n\t\t\t</p:spPr>\n\t\t</p:pic>\n\t\t').replace(/\t|\n/g,"")}}},{}],4:[function(t,e,r){"use strict";var n=t("xmldom"),o=n.DOMParser,a=n.XMLSerializer,i=t("./errors").throwXmlTagNotFound;function s(t){return t[t.length-1]}var u={nullGetter:function(t){return t.module?(t.module,""):"undefined"},xmlFileNames:[],parser:function(t){return n=function(e){return"."===t?e:e[t]},(r="get")in(e={})?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e;var e,r,n},linebreaks:!1,delimiters:{start:"{",end:"}"}};var l={"&":"&amp;","'":"&apos;","<":"&lt;",">":"&gt;",'"':"&quot;"},c=/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;function p(t){return t.replace(c,"\\$&")}var f=Object.keys(l).map((function(t){var e=l[t];return{rstart:new RegExp(p(e),"g"),rend:new RegExp(p(t),"g"),start:e,end:t}}));var h=new RegExp(String.fromCharCode(160),"g");function d(t,e,r){for(var n=r,o=t.length;n<o;n++){if(t[n].value==="</"+e+">")return n}return null}function m(t,e,r){for(var n=r;n>=0;n--){var o=t[n];if(0===o.value.indexOf("<"+e)&&-1!==[">"," "].indexOf(o.value[e.length+1]))return n}return null}function g(t,e){var r=e.type,n=e.tag,o=e.position;return"tag"===r&&n===t&&"start"===o}function v(t,e){var r=e.type,n=e.tag,o=e.position;return"tag"===r&&n===t&&"end"===o}var x=/[\x00-\x08\x0B\x0C\x0E-\x1F]/;e.exports={endsWith:function(t,e){return-1!==t.indexOf(e,t.length-e.length)},startsWith:function(t,e){return t.substring(0,e.length)===e},getNearestLeft:function(t,e,r){for(var n=r;n>=0;n--)for(var o=t[n],a=0,i=e.length;a<i;a++){var s=e[a];if(0===o.value.indexOf("<"+s)&&-1!==[">"," "].indexOf(o.value[s.length+1]))return e[a]}return null},getNearestRight:function(t,e,r){for(var n=r,o=t.length;n<o;n++)for(var a=t[n],i=0,s=e.length;i<s;i++){var u=e[i];if(a.value==="</"+u+">")return e[i]}return-1},isContent:function(t){return"placeholder"===t.type||"content"===t.type&&"insidetag"===t.position},isParagraphStart:function(t){return g("w:p",t)||g("a:p",t)},isParagraphEnd:function(t){return v("w:p",t)||v("a:p",t)},isTagStart:g,isTagEnd:v,isTextStart:function(t){return"tag"===t.type&&"start"===t.position&&t.text},isTextEnd:function(t){return"tag"===t.type&&"end"===t.position&&t.text},unique:function(t){for(var e={},r=[],n=0,o=t.length;n<o;++n)e.hasOwnProperty(t[n])||(e[t[n]]=!0,r.push(t[n]));return r},chunkBy:function(t,e){return t.reduce((function(t,r){var n=s(t);if(0===n.length)return n.push(r),t;var o=e(r);return"start"===o?t.push([r]):"end"===o?(n.push(r),t.push([])):n.push(r),t}),[[]]).filter((function(t){return t.length>0}))},last:s,mergeObjects:function(){for(var t,e,r={},n=0;n<arguments.length;n+=1){t=arguments[n],e=Object.keys(t);for(var o=0;o<e.length;o+=1)r[e[o]]=t[e[o]]}return r},xml2str:function(t){return(new a).serializeToString(t).replace(/xmlns(:[a-z0-9]+)?="" ?/g,"")},str2xml:function(t){return(new o).parseFromString(t,"text/xml")},getRightOrNull:d,getRight:function(t,e,r){var n=d(t,e,r);if(null!==n)return n;i({position:"right",element:e,parsed:t,index:r})},getLeftOrNull:m,getLeft:function(t,e,r){var n=m(t,e,r);if(null!==n)return n;i({position:"left",element:e,parsed:t,index:r})},pregMatchAll:function(t,e){for(var r,n=[];null!=(r=t.exec(e));)n.push({array:r,offset:r.index});return n},convertSpaces:function(t){return t.replace(h," ")},escapeRegExp:p,charMapRegexes:f,hasCorruptCharacters:function(t){return x.test(t)},defaults:u,wordToUtf8:function(t){for(var e,r=0,n=f.length;r<n;r++)e=f[r],t=t.replace(e.rstart,e.end);return t},utf8ToWord:function(t){var e;"string"!=typeof t&&(t=t.toString());for(var r=0,n=f.length;r<n;r++)e=f[r],t=t.replace(e.rend,e.start);return t},concatArrays:function(t){for(var e=[],r=0;r<t.length;r++)for(var n=t[r],o=0,a=n.length;o<a;o++)e.push(n[o]);return e},charMap:l}},{"./errors":6,xmldom:25}],5:[function(t,e,r){"use strict";function n(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=t("./doc-utils");o.traits=t("./traits"),o.moduleWrapper=t("./module-wrapper");var a=t("./lexer"),i=o.defaults,s=o.str2xml,u=o.xml2str,l=o.moduleWrapper,c=o.utf8ToWord,p=o.concatArrays,f=o.unique,h=t("./errors"),d=h.XTInternalError,m=h.throwFileTypeNotIdentified,g=h.throwFileTypeNotHandled,v=h.throwApiVersionError,x=[3,7,0],y=function(){function t(){if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),arguments.length>0)throw new Error("The constructor with parameters has been removed in docxtemplater 3, please check the upgrade guide.");this.compiled={},this.modules=[],this.setOptions({})}var e,r,o;return e=t,r=[{key:"getModuleApiVersion",value:function(){return x.join(".")}},{key:"verifyApiVersion",value:function(t){return 3!==(t=t.split(".").map((function(t){return parseInt(t,10)}))).length&&v("neededVersion is not a valid version",{neededVersion:t,explanation:"the neededVersion must be an array of length 3"}),t[0]!==x[0]&&v("The major api version do not match, you probably have to update docxtemplater with npm install --save docxtemplater",{neededVersion:t,currentModuleApiVersion:x,explanation:"moduleAPIVersionMismatch : needed=".concat(t.join("."),", current=").concat(x.join("."))}),t[1]>x[1]&&v("The minor api version is not uptodate, you probably have to update docxtemplater with npm install --save docxtemplater",{neededVersion:t,currentModuleApiVersion:x,explanation:"moduleAPIVersionMismatch : needed=".concat(t.join("."),", current=").concat(x.join("."))}),!0}},{key:"setModules",value:function(t){this.modules.forEach((function(e){e.set(t)}))}},{key:"sendEvent",value:function(t){this.modules.forEach((function(e){e.on(t)}))}},{key:"attachModule",value:function(t){var e=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).prefix;e&&(t.prefix=e);var r=l(t);return this.modules.push(r),r.on("attached"),this}},{key:"setOptions",value:function(t){var e=this;return t.delimiters&&(t.delimiters.start=c(t.delimiters.start),t.delimiters.end=c(t.delimiters.end)),this.options=t,Object.keys(i).forEach((function(t){var r=i[t];e.options[t]=null!=e.options[t]?e.options[t]:r,e[t]=e.options[t]})),this.zip&&this.updateFileTypeConfig(),this}},{key:"loadZip",value:function(t){if(t.loadAsync)throw new d("Docxtemplater doesn't handle JSZip version >=3, see changelog");return this.zip=t,this.updateFileTypeConfig(),this.modules=p([this.fileTypeConfig.baseModules.map((function(t){return t()})),this.modules]),this}},{key:"compileFile",value:function(t){var e=this.createTemplateClass(t);e.parse(),this.compiled[t]=e}},{key:"resolveData",value:function(t){var e=this;return Promise.all(Object.keys(this.compiled).map((function(r){return e.compiled[r].resolveTags(t)}))).then((function(t){return p(t)}))}},{key:"compile",value:function(){var t=this;return Object.keys(this.compiled).length||(this.options=this.modules.reduce((function(e,r){return r.optionsTransformer(e,t)}),this.options),this.options.xmlFileNames=f(this.options.xmlFileNames),this.xmlDocuments=this.options.xmlFileNames.reduce((function(e,r){var n=t.zip.files[r].asText();return e[r]=s(n),e}),{}),this.setModules({zip:this.zip,xmlDocuments:this.xmlDocuments}),this.getTemplatedFiles(),this.setModules({compiled:this.compiled}),this.templatedFiles.forEach((function(e){null!=t.zip.files[e]&&t.compileFile(e)}))),this}},{key:"updateFileTypeConfig",value:function(){var e;return this.zip.files.mimetype&&(e="odt"),(this.zip.files["word/document.xml"]||this.zip.files["word/document2.xml"])&&(e="docx"),this.zip.files["ppt/presentation.xml"]&&(e="pptx"),"odt"===e&&g(e),e||m(),this.fileType=e,this.fileTypeConfig=this.options.fileTypeConfig||t.FileTypeConfig[this.fileType],this}},{key:"render",value:function(){var t=this;return this.compile(),this.setModules({data:this.data,Lexer:a}),this.mapper=this.modules.reduce((function(t,e){return e.getRenderedMap(t)}),{}),this.fileTypeConfig.tagsXmlLexedArray=f(this.fileTypeConfig.tagsXmlLexedArray),this.fileTypeConfig.tagsXmlTextArray=f(this.fileTypeConfig.tagsXmlTextArray),Object.keys(this.mapper).forEach((function(e){var r=t.mapper[e],n=r.from,o=r.data,a=t.compiled[n];a.setTags(o),a.render(e),t.zip.file(e,a.content,{createFolders:!0})})),this.sendEvent("syncing-zip"),this.syncZip(),this}},{key:"syncZip",value:function(){var t=this;Object.keys(this.xmlDocuments).forEach((function(e){t.zip.remove(e);var r=u(t.xmlDocuments[e]);return t.zip.file(e,r,{createFolders:!0})}))}},{key:"setData",value:function(t){return this.data=t,this}},{key:"getZip",value:function(){return this.zip}},{key:"createTemplateClass",value:function(t){var e=this.zip.files[t].asText();return this.createTemplateClassFromContent(e,t)}},{key:"createTemplateClassFromContent",value:function(e,r){var n=this,o={filePath:r};return Object.keys(i).forEach((function(t){o[t]=n[t]})),o.fileTypeConfig=this.fileTypeConfig,o.modules=this.modules,new t.XmlTemplater(e,o)}},{key:"getFullText",value:function(t){return this.createTemplateClass(t||this.fileTypeConfig.textPath(this.zip)).getFullText()}},{key:"getTemplatedFiles",value:function(){return this.templatedFiles=this.fileTypeConfig.getTemplatedFiles(this.zip),this.templatedFiles}}],r&&n(e.prototype,r),o&&n(e,o),t}();y.DocUtils=o,y.Errors=t("./errors"),y.XmlTemplater=t("./xml-templater"),y.FileTypeConfig=t("./file-type-config"),y.XmlMatcher=t("./xml-matcher"),e.exports=y},{"./doc-utils":4,"./errors":6,"./file-type-config":7,"./lexer":8,"./module-wrapper":10,"./traits":22,"./xml-matcher":23,"./xml-templater":24}],6:[function(t,e,r){"use strict";function n(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function o(t){this.name="GenericError",this.message=t,this.stack=new Error(t).stack}function a(t){this.name="TemplateError",this.message=t,this.stack=new Error(t).stack}function i(t){this.name="RenderingError",this.message=t,this.stack=new Error(t).stack}function s(t){this.name="ScopeParserError",this.message=t,this.stack=new Error(t).stack}function u(t){this.name="InternalError",this.properties={explanation:"InternalError"},this.message=t,this.stack=new Error(t).stack}function l(t){this.name="APIVersionError",this.properties={explanation:"APIVersionError"},this.message=t,this.stack=new Error(t).stack}o.prototype=Error.prototype,a.prototype=new o,i.prototype=new o,s.prototype=new o,u.prototype=new o,l.prototype=new o,e.exports={XTError:o,XTTemplateError:a,XTInternalError:u,XTScopeParserError:s,XTAPIVersionError:l,RenderingError:i,getClosingTagNotMatchOpeningTag:function(t){var e=t.tags,r=new a("Closing tag does not match opening tag");return r.properties={id:"closing_tag_does_not_match_opening_tag",explanation:'The tag "'.concat(e[0].value,'" is closed by the tag "').concat(e[1].value,'"'),openingtag:e[0].value,offset:[e[0].offset,e[1].offset],closingtag:e[1].value},r},getLoopPositionProducesInvalidXMLError:function(t){var e=t.tag,r=new a('The position of the loop tags "'.concat(e,'" would produce invalid XML'));return r.properties={tag:e,id:"loop_position_invalid",explanation:'The tags "'.concat(e,'" are misplaced in the document, for example one of them is in a table and the other one outside the table')},r},getScopeCompilationError:function(t){var e=t.tag,r=t.rootError,n=new s("Scope parser compilation failed");return n.properties={id:"scopeparser_compilation_failed",tag:e,explanation:'The scope parser for the tag "'.concat(e,'" failed to compile'),rootError:r},n},getScopeParserExecutionError:function(t){var e=t.tag,r=t.scope,n=t.error,o=new s("Scope parser execution failed");return o.properties={id:"scopeparser_execution_failed",explanation:"The scope parser for the tag ".concat(e," failed to execute"),scope:r,tag:e,rootError:n},o},getUnclosedTagException:function(t){var e,r=new a("Unclosed tag");return r.properties={xtag:(e=t.xtag.split(" "),e[0]).substr(1),id:"unclosed_tag",context:t.xtag,offset:t.offset,lIndex:t.lIndex,explanation:'The tag beginning with "'.concat(t.xtag.substr(0,10),'" is unclosed')},r},getUnmatchedLoopException:function(t){var e=t.location,r="start"===e?"unclosed":"unopened",n=new a("".concat("start"===e?"Unclosed":"Unopened"," loop")),o=t.part.value;return n.properties={id:"".concat(r,"_loop"),explanation:'The loop with tag "'.concat(o,'" is ').concat(r),xtag:o},n},getUnopenedTagException:function(t){var e,r=new a("Unopened tag");return r.properties={xtag:(e=t.xtag.split(" "),e[e.length-1]),id:"unopened_tag",context:t.xtag,offset:t.offset,lIndex:t.lIndex,explanation:'The tag beginning with "'.concat(t.xtag.substr(0,10),'" is unopened')},r},throwApiVersionError:function(t,e){var r=new l(t);throw r.properties=function(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},o=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(r).filter((function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable})))),o.forEach((function(e){n(t,e,r[e])}))}return t}({id:"api_version_error"},e),r},throwContentMustBeString:function(t){var e=new u("Content must be a string");throw e.properties.id="xmltemplater_content_must_be_string",e.properties.type=t,e},throwCorruptCharacters:function(t){var e=t.tag,r=t.value,n=new i("There are some XML corrupt characters");throw n.properties={id:"invalid_xml_characters",xtag:e,value:r,explanation:"There are some corrupt characters for the field ${tag}"},n},throwFileTypeNotHandled:function(t){var e=new u('The filetype "'.concat(t,'" is not handled by docxtemplater'));throw e.properties={id:"filetype_not_handled",explanation:'The file you are trying to generate is of type "'.concat(t,'", but only docx and pptx formats are handled'),fileType:t},e},throwFileTypeNotIdentified:function(){var t=new u("The filetype for this file could not be identified, is this file corrupted ?");throw t.properties={id:"filetype_not_identified"},t},throwLocationInvalid:function(t){throw new u('Location should be one of "start" or "end" (given : '.concat(t.location,")"))},throwMalformedXml:function(t){var e=new u("Malformed xml");throw e.properties={part:t,id:"malformed_xml"},e},throwMultiError:function(t){var e=new a("Multi error");throw e.properties={errors:t,id:"multi_error",explanation:"The template has multiple errors"},e},throwRawTagNotInParagraph:function(t){var e=new a("Raw tag not in paragraph"),r=t.part,n=r.value,o=r.offset;throw e.properties={id:"raw_tag_outerxml_invalid",explanation:'The tag "'.concat(n,'" is not inside a paragraph'),rootError:t.rootError,xtag:n,offset:o,postparsed:t.postparsed,expandTo:t.expandTo,index:t.index},e},throwRawTagShouldBeOnlyTextInParagraph:function(t){var e=new a("Raw tag should be the only text in paragraph"),r=t.part.value;throw e.properties={id:"raw_xml_tag_should_be_only_text_in_paragraph",explanation:'The raw tag "'.concat(r,'" should be the only text in this paragraph. This means that this tag should not be surrounded by any text or spaces.'),xtag:r,offset:t.part.offset,paragraphParts:t.paragraphParts},e},throwUnimplementedTagType:function(t){var e=new a('Unimplemented tag type "'.concat(t.type,'"'));throw e.properties={part:t,id:"unimplemented_tag_type"},e},throwXmlTagNotFound:function(t){var e=new a('No tag "'.concat(t.element,'" was found at the ').concat(t.position));throw e.properties={id:"no_xml_tag_found_at_".concat(t.position),explanation:'No tag "'.concat(t.element,'" was found at the ').concat(t.position),part:t.parsed[t.index],parsed:t.parsed,index:t.index,element:t.element},e},throwXmlInvalid:function(t,e){var r=new a("An XML file has invalid xml");throw r.properties={id:"file_has_invalid_xml",content:t,offset:e,explanation:"The docx contains invalid XML, it is most likely corrupt"},r}}},{}],7:[function(t,e,r){"use strict";var n=t("./modules/loop"),o=t("./modules/space-preserve"),a=t("./modules/rawxml"),i=t("./modules/expand-pair-trait"),s=t("./modules/render"),u={getTemplatedFiles:function(t){return t.file(/ppt\/(slides|slideMasters)\/(slide|slideMaster)\d+\.xml/).map((function(t){return t.name})).concat(["ppt/presentation.xml","docProps/app.xml","docProps/core.xml"])},textPath:function(){return"ppt/slides/slide1.xml"},tagsXmlTextArray:["Company","HyperlinkBase","Manager","cp:category","cp:keywords","dc:creator","dc:description","dc:subject","dc:title","a:t","m:t","vt:lpstr"],tagsXmlLexedArray:["p:sp","a:tc","a:tr","a:table","a:p","a:r","a:rPr"],expandTags:[{contains:"a:tc",expand:"a:tr"}],onParagraphLoop:[{contains:"a:p",expand:"a:p",onlyTextInTag:!0}],tagRawXml:"p:sp",tagTextXml:"a:t",baseModules:[n,i,a,s]},l={getTemplatedFiles:function(t){return t.file(/word\/(header|footer)\d+\.xml/).map((function(t){return t.name})).concat(["docProps/core.xml","docProps/app.xml","word/document.xml","word/document2.xml"])},textPath:function(t){return t.files["word/document.xml"]?"word/document.xml":t.files["word/document2.xml"]?"word/document2.xml":void 0},tagsXmlTextArray:["Company","HyperlinkBase","Manager","cp:category","cp:keywords","dc:creator","dc:description","dc:subject","dc:title","w:t","m:t","vt:lpstr"],tagsXmlLexedArray:["w:tc","w:tr","w:table","w:p","w:r","w:rPr","w:pPr","w:spacing"],expandTags:[{contains:"w:tc",expand:"w:tr"}],onParagraphLoop:[{contains:"w:p",expand:"w:p",onlyTextInTag:!0}],tagRawXml:"w:p",tagTextXml:"w:t",baseModules:[n,o,i,a,s]};e.exports={docx:l,pptx:u}},{"./modules/expand-pair-trait":11,"./modules/loop":12,"./modules/rawxml":13,"./modules/render":14,"./modules/space-preserve":15}],8:[function(t,e,r){"use strict";function n(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var r=[],n=!0,o=!1,a=void 0;try{for(var i,s=t[Symbol.iterator]();!(n=(i=s.next()).done)&&(r.push(i.value),!e||r.length!==e);n=!0);}catch(t){o=!0,a=t}finally{try{n||null==s.return||s.return()}finally{if(o)throw a}}return r}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var o=t("./errors"),a=o.getUnclosedTagException,i=o.getUnopenedTagException,s=o.throwMalformedXml,u=o.throwXmlInvalid,l=t("./doc-utils"),c=l.concatArrays,p=l.isTextStart,f=l.isTextEnd;function h(t,e){return t[0]<=e.offset&&e.offset<t[1]}function d(t,e){return p(t)?(e&&s(t),!0):f(t)?(e||s(t),!1):e}function m(t){var e="start",r=1;"/"===t[t.length-2]&&(e="selfclosing"),"/"===t[1]&&(r=2,e="end");var n=t.indexOf(" "),o=-1===n?t.length-1:n;return{tag:t.slice(r,o),position:e}}function g(t,e){return t===e?0:-1===t||-1===e?e<t?-1:1:t<e?-1:1}function v(t){var e=t.split(" ");if(2!==e.length)throw new Error("New Delimiters cannot be parsed");var r=n(e,2),o=r[0],a=r[1];if(0===o.length||0===a.length)throw new Error("New Delimiters cannot be parsed");return[o,a]}function x(t){var e=this;this.innerContentParts=t,this.full="",this.parseDelimiters=function(t){e.full=e.innerContentParts.map((function(t){return t.value})).join("");var r=function(t,e){for(var r=[],o=e.start,a=e.end,i=-1;;){var s=t.indexOf(o,i+1),u=t.indexOf(a,i+1),l=null,c=void 0,p=g(s,u);if(0===p)return r;if(1===p&&(i=u,l="end",c=a.length),-1===p&&(i=s,l="start",c=o.length),"start"!==l||"="!==t[i+o.length])r.push({offset:i,position:l,length:c});else{r.push({offset:s,position:"start",length:o.length,changedelimiter:!0});var f=t.indexOf("=",i+o.length+1),h=t.indexOf(a,f+1);r.push({offset:h,position:"end",length:a.length,changedelimiter:!0});var d=n(v(t.substr(i+o.length+1,f-i-o.length-1)),2);o=d[0],a=d[1],i=h}}}(e.full,t),o=0,s=e.innerContentParts.map((function(t){return{offset:(o+=t.value.length)-t.value.length,lIndex:t.lIndex}})),u=function(t,e,r){if(0===t.length)return[];var n,o=[],s=!1,u={offset:0},l=0;t.forEach((function(t){for(;r[l+1]&&!(r[l+1].offset>t.offset);)l++;n=e.substr(u.offset,t.offset-u.offset),"start"===t.position&&s||"end"===t.position&&!s?"start"===t.position?(o.push(a({xtag:n,offset:u.offset})),t.error=!0):(o.push(i({xtag:n,offset:t.offset})),t.error=!0):s=!s,u=t}));var c={offset:e.length};return n=e.substr(u.offset,c.offset-u.offset),s&&(o.push(a({xtag:n,offset:u.offset})),c.error=!0),o}(r,e.full,s),l=0,c=0;e.parsed=s.map((function(t,e){for(var n=t.offset,o=[n,n+this.innerContentParts[e].value.length],a=this.innerContentParts[e].value,i=[];c<r.length&&h(o,r[c]);)i.push(r[c]),c++;var s,u=[],p=0;l>0&&(p=l,l=0),i.forEach((function(t){var e=a.substr(p,t.offset-n-p);if(e.length>0){if(s)return void(t.changedelimiter&&(p=t.offset-n+t.length,s="start"===t.position));u.push({type:"content",value:e,offset:p+n}),p+=e.length}var r={type:"delimiter",position:t.position,offset:p+n};if(t.error&&(r.error=t.error),t.changedelimiter)return s="start"===t.position,void(p=t.offset-n+t.length);u.push(r),p=t.offset-n+t.length})),l=p-a.length;var f=a.substr(p);return f.length>0&&u.push({type:"content",value:f,offset:n}),u}),e),e.errors=u}}e.exports={parse:function(t,e){var r=!1,n=new x(function(t){var e=!1,r=[];return t.forEach((function(t){(e=d(t,e))&&"content"===t.type&&r.push(t)})),r}(t));n.parseDelimiters(e);var o=[],a=0;return t.forEach((function(t){r=d(t,r),"content"===t.type&&(t.position=r?"insidetag":"outsidetag"),r&&"content"===t.type?(Array.prototype.push.apply(o,n.parsed[a].map((function(t){return"content"===t.type&&(t.position="insidetag"),t}))),a++):o.push(t)})),o=o.map((function(t,e){return t.lIndex=e,t})),{errors:n.errors,lexed:o}},xmlparse:function(t,e){var r=function(t,e,r){for(var n=0,o=t.length,a=c([e.map((function(t){return{tag:t,text:!0}})),r.map((function(t){return{tag:t,text:!1}}))]).reduce((function(t,e){return t[e.tag]=e.text,t}),{}),i=[];n<o&&-1!==(n=t.indexOf("<",n));){var s=n,l=t.indexOf("<",n+1);(-1===(n=t.indexOf(">",n))||-1!==l&&n>l)&&u(t,s);var p=t.slice(s,n+1),f=m(p),h=f.tag,d=f.position,g=a[h];null!=g&&i.push({type:"tag",position:d,text:g,offset:s,value:p,tag:h})}return i}(t,e.text,e.other),n=0,o=r.reduce((function(e,r){var o=t.substr(n,r.offset-n);return o.length>0&&e.push({type:"content",value:o}),n=r.offset+r.value.length,delete r.offset,r.value.length>0&&e.push(r),e}),[]),a=t.substr(n);return a.length>0&&o.push({type:"content",value:a}),o}}},{"./doc-utils":4,"./errors":6}],9:[function(t,e,r){"use strict";function n(t,e){for(var r=-1,n=0,o=t.length;n<o;n++)e[n]>=t[n].length||(-1===r||t[n][e[n]].offset<t[r][e[r]].offset)&&(r=n);if(-1===r)throw new Error("minIndex negative");return r}e.exports=function(t){var e=t.reduce((function(t,e){return t+e.length}),0);t=t.filter((function(t){return t.length>0}));for(var r=new Array(e),o=t.map((function(){return 0})),a=0;a<=e-1;){var i=n(t,o);r[a]=t[i][o[i]],o[i]++,a++}return r}},{}],10:[function(t,e,r){"use strict";function n(){}function o(t){return t}e.exports=function(t){var e={set:n,parse:n,render:n,getTraits:n,nullGetter:n,optionsTransformer:o,postrender:o,errorsTransformer:o,getRenderedMap:o,postparse:o,on:n,resolve:n};if(Object.keys(e).every((function(e){return!t[e]})))throw new Error("This module cannot be wrapped, because it doesn't define any of the necessary functions");return Object.keys(e).forEach((function(r){t[r]=t[r]||e[r]})),t}},{}],11:[function(t,e,r){"use strict";function n(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var r=[],n=!0,o=!1,a=void 0;try{for(var i,s=t[Symbol.iterator]();!(n=(i=s.next()).done)&&(r.push(i.value),!e||r.length!==e);n=!0);}catch(t){o=!0,a=t}finally{try{n||null==s.return||s.return()}finally{if(o)throw a}}return r}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var o=t("../mergesort"),a=t("../doc-utils"),i=a.getLeft,s=a.getRight,u=a.getNearestLeft,l=a.getNearestRight,c=t("../module-wrapper"),p=t("../traits").getExpandToDefault,f=t("../errors"),h=f.getUnmatchedLoopException,d=f.getClosingTagNotMatchOpeningTag,m=f.throwLocationInvalid;function g(t){switch(t.location){case"start":return 1;case"end":return-1;default:m(t)}}function v(t){var e=[],r=[];if(0===t.length)return{pairs:r,errors:e};var o=1,a=n(t,1)[0];if("start"===a.part.location)for(var i=1;i<t.length;i++){var s=t[i];if(0===(o+=g(s.part))){var u=v(t.slice(i+1));return s.part.value!==a.part.value&&""!==s.part.value?e.push(d({tags:[a.part,s.part]})):r=[[a,s]],{pairs:r.concat(u.pairs),errors:e.concat(u.errors)}}}var l=a.part;e.push(h({part:l,location:l.location}));var c=v(t.slice(1));return{pairs:c.pairs,errors:e.concat(c.errors)}}var x={name:"ExpandPairTrait",optionsTransformer:function(t,e){return this.expandTags=e.fileTypeConfig.expandTags.concat(e.options.paragraphLoop?e.fileTypeConfig.onParagraphLoop:[]),t},postparse:function(t,e){var r=this,n=e.getTraits,a=e.postparse,c=n("expandPair",t);c=c.map((function(t){return t||[]}));var f,h=v(c=o(c)),d=h.pairs,m=h.errors,g=d.map((function(e){var n=e[0].part.expandTo;if("auto"===n){var o=p(t,e,r.expandTags);o.error&&m.push(o.error),n=o.value}return n?[i(t,n,e[0].offset),s(t,n,e[1].offset)]:[e[0].offset,e[1].offset]})),x=0;return{postparsed:t.reduce((function(e,r,n){var o=x<d.length&&g[x][0]<=n,i=d[x],s=g[x];if(!o)return e.push(r),e;var c=s[0],p=s[1],h=u(t,["w:p","w:tc"],c-1),m=l(t,["w:p","w:tc"],p+1);if("w:tc"===h&&"w:tc"===m&&(r.emptyValue="<w:p></w:p>"),s[0]===n&&(f=[]),i[0].offset!==n&&i[1].offset!==n&&f.push(r),s[1]===n){var v=t[i[0].offset];v.subparsed=a(f,{basePart:v}),delete v.location,delete v.expandTo,e.push(v),x++}return e}),[]),errors:m}}};e.exports=function(){return c(x)}},{"../doc-utils":4,"../errors":6,"../mergesort":9,"../module-wrapper":10,"../traits":22}],12:[function(t,e,r){"use strict";function n(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var r=[],n=!0,o=!1,a=void 0;try{for(var i,s=t[Symbol.iterator]();!(n=(i=s.next()).done)&&(r.push(i.value),!e||r.length!==e);n=!0);}catch(t){o=!0,a=t}finally{try{n||null==s.return||s.return()}finally{if(o)throw a}}return r}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function o(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var a=t("../doc-utils"),i=a.mergeObjects,s=a.chunkBy,u=a.last,l=a.isParagraphStart,c=a.isParagraphEnd,p=a.isContent,f=t("../module-wrapper"),h=t("../prefix-matcher"),d=h.match,m=h.getValue,g=h.getValues,v="loop";function x(t){return t.some((function(t){return p(t)}))?0:t.length}var y=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.name="LoopModule",this.prefix={start:"#",end:"/",dash:/^-([^\s]+)\s(.+)$/,inverted:"^"}}var e,r,a;return e=t,r=[{key:"parse",value:function(t){var e=v,r="placeholder",o=this.prefix,a=o.start,i=o.inverted,s=o.dash,u=o.end;if(d(a,t))return{type:r,value:m(a,t),expandTo:"auto",module:e,location:"start",inverted:!1};if(d(i,t))return{type:r,value:m(i,t),expandTo:"auto",module:e,location:"start",inverted:!0};if(d(u,t))return{type:r,value:m(u,t),module:e,location:"end"};if(d(s,t)){var l=n(g(s,t),3),c=l[1];return{type:r,value:l[2],expandTo:c,module:e,location:"start",inverted:!1}}return null}},{key:"getTraits",value:function(t,e){if("expandPair"===t)return e.reduce((function(t,e,r){return"placeholder"===e.type&&e.module===v&&t.push({part:e,offset:r}),t}),[])}},{key:"postparse",value:function(t,e){var r=e.basePart;if(!function(t){return 0!==t.length&&l(t[0])&&c(u(t))}(t))return t;if(!r||"auto"!==r.expandTo||r.module!==v)return t;var n=s(t,(function(t){return l(t)?"start":c(t)?"end":null}));if(n.length<=2)return t;var o=n[0],a=u(n),i=x(o),p=x(a);return 0===i||0===p?t:t.slice(i,t.length-p)}},{key:"render",value:function(t,e){if("placeholder"!==t.type||t.module!==v)return null;var r=[],n=[];return!1===e.scopeManager.loopOver(t.value,(function(o,a){var s=e.scopeManager.createSubScopeManager(o,t.value,a,t),u=e.render(i({},e,{compiled:t.subparsed,tags:{},scopeManager:s}));r=r.concat(u.parts),n=n.concat(u.errors||[])}),t.inverted,{part:t})?{value:t.emptyValue||"",errors:n}:{value:r.join(""),errors:n}}},{key:"resolve",value:function(t,e){if("placeholder"!==t.type||t.module!==v)return null;var r=e.scopeManager.getValue(t.value,{part:t}),n=[];function o(r,o){var a=e.scopeManager.createSubScopeManager(r,t.value,o,t);n.push(e.resolve(i(e,{compiled:t.subparsed,tags:{},scopeManager:a})))}return Promise.resolve(r).then((function(r){return e.scopeManager.loopOverValue(r,o,t.inverted),Promise.all(n).then((function(t){return t.map((function(t){return t.resolved}))}))})).then((function(t){return t}))}}],r&&o(e.prototype,r),a&&o(e,a),t}();e.exports=function(){return f(new y)}},{"../doc-utils":4,"../module-wrapper":10,"../prefix-matcher":18}],13:[function(t,e,r){"use strict";function n(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=t("../traits"),a=t("../doc-utils"),i=a.isContent,s=a.getNearestLeft,u=a.getNearestRight,l=t("../errors").throwRawTagShouldBeOnlyTextInParagraph,c=t("../prefix-matcher"),p=c.match,f=c.getValue,h="rawxml",d=t("../module-wrapper");function m(t){var e=t.part,r=t.left,n=t.right,o=t.postparsed,a=t.index,c=s(o,["w:p","w:tc"],r-1);"w:tc"===u(o,["w:p","w:tc"],n+1)&&"w:tc"===c&&(e.emptyValue="<w:p></w:p>");var p=o.slice(r+1,n);return p.forEach((function(t,n){n!==a-r-1&&i(t)&&l({paragraphParts:p,part:e})})),e}var g=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.name="RawXmlModule",this.prefix="@"}var e,r,a;return e=t,(r=[{key:"optionsTransformer",value:function(t,e){return this.fileTypeConfig=e.fileTypeConfig,t}},{key:"parse",value:function(t){return p(this.prefix,t)?{type:"placeholder",value:f(this.prefix,t),module:h}:null}},{key:"postparse",value:function(t){return o.expandToOne(t,{moduleName:h,getInner:m,expandTo:this.fileTypeConfig.tagRawXml})}},{key:"render",value:function(t,e){if(t.module!==h)return null;var r=e.scopeManager.getValue(t.value,{part:t});return null==r&&(r=e.nullGetter(t)),r?{value:r}:{value:t.emptyValue||""}}},{key:"resolve",value:function(t,e){return"placeholder"!==t.type||t.module!==h?null:e.scopeManager.getValueAsync(t.value,{part:t}).then((function(r){return null==r?e.nullGetter(t):r}))}}])&&n(e.prototype,r),a&&n(e,a),t}();e.exports=function(){return d(new g)}},{"../doc-utils":4,"../errors":6,"../module-wrapper":10,"../prefix-matcher":18,"../traits":22}],14:[function(t,e,r){"use strict";function n(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=t("../module-wrapper"),a=t("../errors").getScopeCompilationError,i=t("../doc-utils"),s=i.utf8ToWord,u=i.hasCorruptCharacters,l=t("../errors").throwCorruptCharacters,c={docx:"w",pptx:"a"},p=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.name="Render",this.recordRun=!1,this.recordedRun=[]}var e,r,o;return e=t,(r=[{key:"set",value:function(t){t.compiled&&(this.compiled=t.compiled),null!=t.data&&(this.data=t.data)}},{key:"getRenderedMap",value:function(t){var e=this;return Object.keys(this.compiled).reduce((function(t,r){return t[r]={from:r,data:e.data},t}),t)}},{key:"optionsTransformer",value:function(t,e){return this.parser=e.parser,this.fileType=e.fileType,t}},{key:"postparse",value:function(t){var e=this,r=[];return t.forEach((function(t){if("placeholder"===t.type){var n=t.value;try{e.parser(n,{tag:t})}catch(t){r.push(a({tag:n,rootError:t}))}}})),{postparsed:t,errors:r}}},{key:"recordRuns",value:function(t){t.tag==="".concat(c[this.fileType],":r")?(this.recordRun=!1,this.recordedRun=[]):t.tag==="".concat(c[this.fileType],":rPr")?("start"===t.position&&(this.recordRun=!0,this.recordedRun=[t.value]),"end"===t.position&&(this.recordedRun.push(t.value),this.recordRun=!1)):this.recordRun&&this.recordedRun.push(t.value)}},{key:"render",value:function(t,e){var r=e.scopeManager,n=e.linebreaks,o=e.nullGetter;if(n&&this.recordRuns(t),"placeholder"===t.type&&!t.module){var a=r.getValue(t.value,{part:t});if(null==a&&(a=o(t)),u(a)&&l({tag:t.value,value:a}),"string"!=typeof a&&(a=a.toString()),n){var i=c[this.fileType],p="docx"===this.fileType?"<w:r><w:br/></w:r>":"<a:br/>",f=a.split("\n"),h=this.recordedRun.join("");return{value:f.map((function(t){return s(t)})).join("</".concat(i,":t></").concat(i,":r>").concat(p,"<").concat(i,":r>").concat(h,"<").concat(i,":t").concat("docx"===this.fileType?' xml:space="preserve"':"",">"))}}return{value:s(a)}}}}])&&n(e.prototype,r),o&&n(e,o),t}();e.exports=function(){return o(new p)}},{"../doc-utils":4,"../errors":6,"../module-wrapper":10}],15:[function(t,e,r){"use strict";var n=t("../module-wrapper"),o=t("../doc-utils"),a=o.isTextStart,i=o.isTextEnd,s=o.endsWith,u=o.startsWith,l='<w:t xml:space="preserve">',c="</w:t>";function p(t,e){var r=t[e].value;return"</w:t>"===t[e+1].value||-1!==r.indexOf('xml:space="preserve"')?r:r.substr(0,r.length-1)+' xml:space="preserve">'}var f={name:"SpacePreserveModule",postparse:function(t,e){var r=[],n=!1,o=0,s=0;var u=t.reduce((function(t,u){return function(t){return a(t)&&"w:t"===t.tag}(u)&&(n=!0,s=r.length),n?(r.push(u),function(t,e){return t&&t.basePart&&e.length>1}(e,r)&&(o=e.basePart.endLindex,r[0].value=p(r,0)),function(t,e){return!o&&"placeholder"===t.type&&(!t.module||"loop"===t.module)&&e.length>1}(u,r)&&(o=u.endLindex,r[0].value=p(r,0)),i(u)&&u.lIndex>o&&(0!==o&&(r[s].value=p(r,s)),Array.prototype.push.apply(t,r),r=[],n=!1,o=0,s=0),t):(t.push(u),t)}),[]);return Array.prototype.push.apply(u,r),u},postrender:function(t){return t.filter((function(t){return 0!==t.length})).reduce((function(t,e,r,n){return-1!==e.indexOf('<w:t xml:space="preserve"></w:t>')&&(e=e.replace(/<w:t xml:space="preserve"><\/w:t>/g,"<w:t/>")),s(e,l)&&u(n[r+1],c)&&(e=e.substr(0,e.length-26)+"<w:t/>",n[r+1]=n[r+1].substr(6)),t.push(e),t}),[])}};e.exports=function(){return n(f)}},{"../doc-utils":4,"../module-wrapper":10}],16:[function(t,e,r){"use strict";function n(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}var o=t("./doc-utils"),a=o.wordToUtf8,i=o.concatArrays;var s={postparse:function(t,e){function r(t,r){return e.map((function(e){return e.getTraits(t,r)}))}var o=[];function a(t,s){return e.reduce((function(t,e){var u=e.postparse(t,function(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},o=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(r).filter((function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable})))),o.forEach((function(e){n(t,e,r[e])}))}return t}({},s,{postparse:a,getTraits:r}));return u.errors?(o=i([o,u.errors]),u.postparsed):u}),t)}return{postparsed:a(t),errors:o}},parse:function(t,e){var r,n=!1,o="",i=[];return t.reduce((function(t,s){if("delimiter"===s.type){if(n="start"===s.position,"end"===s.position){var u=s.lIndex;o=a(o),t=function(t,e,r,n,o){for(var a,i=0,s=t.length;i<s;i++)if(a=t[i].parse(e))return a.offset=n,a.endLindex=o,a.lIndex=o,a.raw=e,r.push(a),r;return r.push({type:"placeholder",value:e,offset:n,endLindex:o,lIndex:o}),r}(e,o,t,r,u),r=null,Array.prototype.push.apply(t,i),i=[]}return"start"===s.position&&(i=[],r=s.offset),o="",t}return n?"content"!==s.type||"insidetag"!==s.position?(i.push(s),t):(o+=s.value,t):(t.push(s),t)}),[])}};e.exports=s},{"./doc-utils":4}],17:[function(t,e,r){"use strict";e.exports=function(t,e){for(var r=0,n=e.modules.length;r<n;r++){t=e.modules[r].postrender(t,e)}return t.join("")}},{}],18:[function(t,e,r){"use strict";e.exports={match:function(t,e){return"string"==typeof t?e.substr(0,t.length)===t:t instanceof RegExp?t.test(e):void 0},getValue:function(t,e){return"string"==typeof t?e.substr(t.length):t instanceof RegExp?e.match(t)[1]:void 0},getValues:function(t,e){if(t instanceof RegExp)return e.match(t)}}},{}],19:[function(t,e,r){"use strict";var n=t("./doc-utils").concatArrays,o=t("./errors").throwUnimplementedTagType;e.exports=function(t){var e=t.baseNullGetter,r=t.compiled,a=t.scopeManager;t.nullGetter=function(t,r){return e(t,r||a)};var i=[],s=r.map((function(e){var r=function(t,e){for(var r,n=0,o=e.modules.length;n<o;n++)if(r=e.modules[n].render(t,e))return r;return!1}(e,t);return r?(r.errors&&(i=n([i,r.errors])),r.value):"content"===e.type||"tag"===e.type?e.value:void o(e)}));return{errors:i,parts:s}}},{"./doc-utils":4,"./errors":6}],20:[function(t,e,r){"use strict";e.exports=function(t){var e=[],r=t.baseNullGetter,n=t.compiled,o=t.scopeManager;t.nullGetter=function(t,e){return r(t,e||o)},t.resolved=e;var a=[];return Promise.all(n.map((function(r){var n=function(t,e){for(var r,n=0,o=e.modules.length;n<o;n++)if(r=e.modules[n].resolve(t,e))return r;return!1}(r,t);return n?n.then((function(t){e.push({tag:r.value,value:t,lIndex:r.lIndex})})):"placeholder"===r.type?o.getValueAsync(r.value,{part:r}).then((function(n){return null==n&&(n=t.nullGetter(r)),e.push({tag:r.value,value:n,lIndex:r.lIndex}),n})):void 0})).filter((function(t){return t}))).then((function(){return{errors:a,resolved:e}}))}},{}],21:[function(t,e,r){"use strict";function n(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=t("./errors").getScopeParserExecutionError;function a(t,e){for(var r,n=t.length>>>0,o=0;o<n;o++)if(r=t[o],e.call(this,r,o,t))return r}function i(t,e,r){var n=this;this.num=r;var s,u=this.scopeList[this.num];if(this.resolved){var l=this.resolved;return this.scopePath.forEach((function(t,e){var r=n.scopeLindex[e];l=(l=a(l,(function(t){return t.lIndex===r}))).value[n.scopePathItem[e]]})),a(l,(function(t){return e.part.lIndex===t.lIndex})).value}var c=this.parser(t,{scopePath:this.scopePath});try{s=c.get(u,this.getContext(e))}catch(e){throw o({tag:t,scope:u,error:e})}return null==s&&this.num>0?i.call(this,t,e,r-1):s}function s(t,e,r){var n=this;this.num=r;var a=this.scopeList[this.num],i=this.parser(t,{scopePath:this.scopePath});return Promise.resolve(i.get(a,this.getContext(e))).catch((function(e){throw o({tag:t,scope:a,error:e})})).then((function(o){return null==o&&r>0?s.call(n,t,e,r-1):o}))}var u=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.scopePath=e.scopePath,this.scopePathItem=e.scopePathItem,this.scopeList=e.scopeList,this.scopeLindex=e.scopeLindex,this.parser=e.parser,this.resolved=e.resolved}var e,r,o;return e=t,(r=[{key:"loopOver",value:function(t,e,r,n){return r=r||!1,this.loopOverValue(this.getValue(t,n),e,r)}},{key:"functorIfInverted",value:function(t,e,r,n){return t&&e(r,n),t}},{key:"isValueFalsy",value:function(t,e){return null==t||!t||"[object Array]"===e&&0===t.length}},{key:"loopOverValue",value:function(t,e,r){this.resolved&&(r=!1);var n=Object.prototype.toString.call(t),o=this.scopeList[this.num];if(this.isValueFalsy(t,n))return this.functorIfInverted(r,e,o,0);if("[object Array]"===n){for(var a,i=0;i<t.length;i++)a=t[i],this.functorIfInverted(!r,e,a,i);return!0}return"[object Object]"===n?this.functorIfInverted(!r,e,t,0):this.functorIfInverted(!r,e,o,0)}},{key:"getValue",value:function(t,e){var r=this.scopeList.length-1;return i.call(this,t,e,r)}},{key:"getValueAsync",value:function(t,e){var r=this.scopeList.length-1;return s.call(this,t,e,r)}},{key:"getContext",value:function(t){return{num:this.num,meta:t,scopeList:this.scopeList,resolved:this.resolved,scopePath:this.scopePath,scopePathItem:this.scopePathItem}}},{key:"createSubScopeManager",value:function(e,r,n,o){return new t({resolved:this.resolved,parser:this.parser,scopeList:this.scopeList.concat(e),scopePath:this.scopePath.concat(r),scopePathItem:this.scopePathItem.concat(n),scopeLindex:this.scopeLindex.concat(o.lIndex)})}}])&&n(e.prototype,r),o&&n(e,o),t}();e.exports=function(t){return t.scopePath=[],t.scopePathItem=[],t.scopeLindex=[],t.scopeList=[t.tags],new u(t)}},{"./errors":6}],22:[function(t,e,r){"use strict";function n(t){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}var o=t("./doc-utils"),a=o.getRightOrNull,i=o.getRight,s=o.getLeft,u=o.getLeftOrNull,l=o.concatArrays,c=o.chunkBy,p=o.isTagStart,f=o.isTagEnd,h=o.isContent,d=o.last,m=t("./errors"),g=m.XTTemplateError,v=m.throwRawTagNotInParagraph,x=m.getLoopPositionProducesInvalidXMLError;function y(t,e){if(0===t.length)return!1;var r=t[t.length-1].tag.substr(1),n=e.substr(2,e.length-3);return 0===r.indexOf(n)}function w(t,e){return t.push({tag:e}),t}e.exports={expandToOne:function(t,e){var r=[];return t.errors&&(r=t.errors,t=t.postparsed),t.reduce((function(t,r){return"placeholder"===r.type&&r.module===e.moduleName&&t.push(r),t}),[]).forEach((function(n){try{t=function(t,e,r){var n,o,a=t.expandTo||r.expandTo,u=e.indexOf(t);if(!a)return e;try{n=i(e,a,u),o=s(e,a,u)}catch(r){throw r instanceof g&&v({part:t,rootError:r,postparsed:e,expandTo:a,index:u}),r}var c=e.slice(o,u),p=e.slice(u+1,n+1),f=r.getInner({index:u,part:t,leftParts:c,rightParts:p,left:o,right:n,postparsed:e});return f.length||(f.expanded=[c,p],f=[f]),l([e.slice(0,o),f,e.slice(n+1)])}(n,t,e)}catch(t){if(!(t instanceof g))throw t;r.push(t)}})),{postparsed:t,errors:r}},getExpandToDefault:function(t,e,r){var o=function(t){for(var e,r=t.filter((function(t){return"tag"===t.type})),n=[],o=0;o<r.length;o++)"/"===(e=r[o].value)[1]?y(n,e)?n.pop():n=w(n,e):"/"!==e[e.length-2]&&(n=w(n,e));return n}(t.slice(e[0].offset,e[1].offset));if(o.filter((function(t){return"/"===t.tag[1]})).length!==o.filter((function(t){var e=t.tag;return"/"!==e[1]&&"/"!==e[e.length-2]})).length)return{error:x({tag:e[0].part.value})};for(var i=function(n,i){var s=r[n],l=s.contains,m=s.expand,g=s.onlyTextInTag;if(function(t,e){for(var r=0;r<e.length;r++)if(0===e[r].tag.indexOf("<".concat(t)))return!0;return!1}(l,o)){if(g){var v=u(t,l,e[0].offset),x=a(t,l,e[1].offset);if(null===v||null===x)return"continue";var y=c(t.slice(v,x),(function(t){return p(l,t)?"start":f(l,t)?"end":null}));if(y.length<=2)return"continue";var w=y[0],b=d(y),T=w.filter(h),N=b.filter(h);if(1!==T.length||1!==N.length)return"continue"}return{v:{value:m}}}},s=0,l=r.length;s<l;s++){var m=i(s);if("continue"!==m&&"object"===n(m))return m.v}return!1}}},{"./doc-utils":4,"./errors":6}],23:[function(t,e,r){"use strict";var n=t("./doc-utils").pregMatchAll;e.exports=function(t,e){var r={};r.content=t,r.tagsXmlArray=e,r.tagsXmlArrayJoined=r.tagsXmlArray.join("|");var o=new RegExp("(?:(<(?:".concat(r.tagsXmlArrayJoined,")[^>]*>)([^<>]*)</(?:").concat(r.tagsXmlArrayJoined,")>)|(<(?:").concat(r.tagsXmlArrayJoined,")[^>]*/>)"),"g");return r.matches=n(o,r.content),function(t){function e(){var e={array:Array.prototype.slice.call(arguments)};e.array.shift();var r=e.array[0]+e.array[1];e.array.unshift(r),e.array.pop();var n=e.array.pop();e.offset=n,e.first=!0,t.matches.unshift(e)}-1===t.content.indexOf("<")&&-1===t.content.indexOf(">")&&t.content.replace(/^()([^<>]*)$/,e);var r=new RegExp("^()([^<]+)</(?:".concat(t.tagsXmlArrayJoined,")>"));return t.content.replace(r,e),r=new RegExp("(<(?:".concat(t.tagsXmlArrayJoined,")[^>]*>)([^>]+)$")),t.content.replace(r,(function(){var e={array:Array.prototype.slice.call(arguments)};e.array.pop();var r=e.array.pop();e.offset=r,e.last=!0,-1===e.array[0].indexOf("/>")&&t.matches.push(e)})),t}(r)}},{"./doc-utils":4}],24:[function(t,e,r){"use strict";function n(t){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}function o(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var a=t("./doc-utils"),i=a.wordToUtf8,s=a.convertSpaces,u=a.defaults,l=t("./scope-manager"),c=t("./xml-matcher"),p=t("./errors"),f=p.throwMultiError,h=p.throwContentMustBeString,d=t("./lexer"),m=t("./parser.js"),g=t("./render.js"),v=t("./postrender.js"),x=t("./resolve.js");e.exports=function(){function t(e,r){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.filePath=r.filePath,this.modules=r.modules,this.fileTypeConfig=r.fileTypeConfig,Object.keys(u).map((function(t){this[t]=null!=r[t]?r[t]:u[t]}),this),this.setModules({inspect:{filePath:this.filePath}}),this.load(e)}var e,r,a;return e=t,r=[{key:"load",value:function(t){"string"!=typeof t&&h(n(t)),this.content=t}},{key:"setTags",value:function(t){return this.tags=null!=t?t:{},this.scopeManager=l({tags:this.tags,parser:this.parser}),this}},{key:"resolveTags",value:function(t){var e=this;this.tags=null!=t?t:{},this.scopeManager=l({tags:this.tags,parser:this.parser});var r=this.getOptions();return r.scopeManager=l(r),r.resolve=x,x(r).then((function(t){var r=t.resolved;return Promise.all(r.map((function(t){return Promise.resolve(t)}))).then((function(t){return e.setModules({inspect:{resolved:t}}),e.resolved=t}))}))}},{key:"getFullText",value:function(){return t=this.content,e=this.fileTypeConfig.tagsXmlTextArray,r=c(t,e).matches.map((function(t){return t.array[2]})),i(s(r.join("")));var t,e,r}},{key:"setModules",value:function(t){this.modules.forEach((function(e){e.set(t)}))}},{key:"parse",value:function(){var t=[];this.xmllexed=d.xmlparse(this.content,{text:this.fileTypeConfig.tagsXmlTextArray,other:this.fileTypeConfig.tagsXmlLexedArray}),this.setModules({inspect:{xmllexed:this.xmllexed}});var e=d.parse(this.xmllexed,this.delimiters),r=e.lexed,n=e.errors;t=t.concat(n),this.lexed=r,this.setModules({inspect:{lexed:this.lexed}}),this.parsed=m.parse(this.lexed,this.modules),this.setModules({inspect:{parsed:this.parsed}});var o=m.postparse(this.parsed,this.modules),a=o.postparsed,i=o.errors;return this.postparsed=a,this.setModules({inspect:{postparsed:this.postparsed}}),t=t.concat(i),this.errorChecker(t),this}},{key:"errorChecker",value:function(t){var e=this;t.length&&(this.modules.forEach((function(e){t=e.errorsTransformer(t)})),t.forEach((function(t){t.properties.file=e.filePath})),f(t))}},{key:"baseNullGetter",value:function(t,e){var r=this,n=this.modules.reduce((function(n,o){return null!=n?n:o.nullGetter(t,e,r)}),null);return null!=n?n:this.nullGetter(t,e)}},{key:"getOptions",value:function(){return{compiled:this.postparsed,tags:this.tags,modules:this.modules,parser:this.parser,baseNullGetter:this.baseNullGetter.bind(this),filePath:this.filePath,linebreaks:this.linebreaks}}},{key:"render",value:function(t){this.filePath=t;var e=this.getOptions();e.resolved=this.resolved,e.scopeManager=l(e),e.render=g;var r=g(e),n=r.errors,o=r.parts;return this.errorChecker(n),this.content=v(o,e),this.setModules({inspect:{content:this.content}}),this}}],r&&o(e.prototype,r),a&&o(e,a),t}()},{"./doc-utils":4,"./errors":6,"./lexer":8,"./parser.js":16,"./postrender.js":17,"./render.js":19,"./resolve.js":20,"./scope-manager":21,"./xml-matcher":23}],25:[function(t,e,r){function n(t){this.options=t||{locator:{}}}function o(){this.cdata=!1}function a(t,e){e.lineNumber=t.lineNumber,e.columnNumber=t.columnNumber}function i(t){if(t)return"\n@"+(t.systemId||"")+"#[line:"+t.lineNumber+",col:"+t.columnNumber+"]"}function s(t,e,r){return"string"==typeof t?t.substr(e,r):t.length>=e+r||e?new java.lang.String(t,e,r)+"":t}function u(t,e){t.currentElement?t.currentElement.appendChild(e):t.doc.appendChild(e)}n.prototype.parseFromString=function(t,e){var r=this.options,n=new l,a=r.domBuilder||new o,s=r.errorHandler,u=r.locator,c=r.xmlns||{},p={lt:"<",gt:">",amp:"&",quot:'"',apos:"'"};return u&&a.setDocumentLocator(u),n.errorHandler=function(t,e,r){if(!t){if(e instanceof o)return e;t=e}var n={},a=t instanceof Function;function s(e){var o=t[e];!o&&a&&(o=2==t.length?function(r){t(e,r)}:t),n[e]=o&&function(t){o("[xmldom "+e+"]\t"+t+i(r))}||function(){}}return r=r||{},s("warning"),s("error"),s("fatalError"),n}(s,a,u),n.domBuilder=r.domBuilder||a,/\/x?html?$/.test(e)&&(p.nbsp=" ",p.copy="©",c[""]="http://www.w3.org/1999/xhtml"),c.xml=c.xml||"http://www.w3.org/XML/1998/namespace",t?n.parse(t,c,p):n.errorHandler.error("invalid doc source"),a.doc},o.prototype={startDocument:function(){this.doc=(new c).createDocument(null,null,null),this.locator&&(this.doc.documentURI=this.locator.systemId)},startElement:function(t,e,r,n){var o=this.doc,i=o.createElementNS(t,r||e),s=n.length;u(this,i),this.currentElement=i,this.locator&&a(this.locator,i);for(var l=0;l<s;l++){t=n.getURI(l);var c=n.getValue(l),p=(r=n.getQName(l),o.createAttributeNS(t,r));this.locator&&a(n.getLocator(l),p),p.value=p.nodeValue=c,i.setAttributeNode(p)}},endElement:function(t,e,r){var n=this.currentElement;n.tagName;this.currentElement=n.parentNode},startPrefixMapping:function(t,e){},endPrefixMapping:function(t){},processingInstruction:function(t,e){var r=this.doc.createProcessingInstruction(t,e);this.locator&&a(this.locator,r),u(this,r)},ignorableWhitespace:function(t,e,r){},characters:function(t,e,r){if(t=s.apply(this,arguments)){if(this.cdata)var n=this.doc.createCDATASection(t);else n=this.doc.createTextNode(t);this.currentElement?this.currentElement.appendChild(n):/^\s*$/.test(t)&&this.doc.appendChild(n),this.locator&&a(this.locator,n)}},skippedEntity:function(t){},endDocument:function(){this.doc.normalize()},setDocumentLocator:function(t){(this.locator=t)&&(t.lineNumber=0)},comment:function(t,e,r){t=s.apply(this,arguments);var n=this.doc.createComment(t);this.locator&&a(this.locator,n),u(this,n)},startCDATA:function(){this.cdata=!0},endCDATA:function(){this.cdata=!1},startDTD:function(t,e,r){var n=this.doc.implementation;if(n&&n.createDocumentType){var o=n.createDocumentType(t,e,r);this.locator&&a(this.locator,o),u(this,o)}},warning:function(t){console.warn("[xmldom warning]\t"+t,i(this.locator))},error:function(t){console.error("[xmldom error]\t"+t,i(this.locator))},fatalError:function(t){throw console.error("[xmldom fatalError]\t"+t,i(this.locator)),t}},"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,(function(t){o.prototype[t]=function(){return null}}));var l=t("./sax").XMLReader,c=r.DOMImplementation=t("./dom").DOMImplementation;r.XMLSerializer=t("./dom").XMLSerializer,r.DOMParser=n},{"./dom":26,"./sax":27}],26:[function(t,e,r){function n(t,e){for(var r in t)e[r]=t[r]}function o(t,e){var r=t.prototype;if(Object.create){var o=Object.create(e.prototype);r.__proto__=o}if(!(r instanceof e)){function a(){}a.prototype=e.prototype,n(r,a=new a),t.prototype=r=a}r.constructor!=t&&("function"!=typeof t&&console.error("unknow Class:"+t),r.constructor=t)}var a={},i=a.ELEMENT_NODE=1,s=a.ATTRIBUTE_NODE=2,u=a.TEXT_NODE=3,l=a.CDATA_SECTION_NODE=4,c=a.ENTITY_REFERENCE_NODE=5,p=a.ENTITY_NODE=6,f=a.PROCESSING_INSTRUCTION_NODE=7,h=a.COMMENT_NODE=8,d=a.DOCUMENT_NODE=9,m=a.DOCUMENT_TYPE_NODE=10,g=a.DOCUMENT_FRAGMENT_NODE=11,v=a.NOTATION_NODE=12,x={},y={},w=(x.INDEX_SIZE_ERR=(y[1]="Index size error",1),x.DOMSTRING_SIZE_ERR=(y[2]="DOMString size error",2),x.HIERARCHY_REQUEST_ERR=(y[3]="Hierarchy request error",3)),b=(x.WRONG_DOCUMENT_ERR=(y[4]="Wrong document",4),x.INVALID_CHARACTER_ERR=(y[5]="Invalid character",5),x.NO_DATA_ALLOWED_ERR=(y[6]="No data allowed",6),x.NO_MODIFICATION_ALLOWED_ERR=(y[7]="No modification allowed",7),x.NOT_FOUND_ERR=(y[8]="Not found",8)),T=(x.NOT_SUPPORTED_ERR=(y[9]="Not supported",9),x.INUSE_ATTRIBUTE_ERR=(y[10]="Attribute in use",10));x.INVALID_STATE_ERR=(y[11]="Invalid state",11),x.SYNTAX_ERR=(y[12]="Syntax error",12),x.INVALID_MODIFICATION_ERR=(y[13]="Invalid modification",13),x.NAMESPACE_ERR=(y[14]="Invalid namespace",14),x.INVALID_ACCESS_ERR=(y[15]="Invalid access",15);function N(t,e){if(e instanceof Error)var r=e;else r=this,Error.call(this,y[t]),this.message=y[t],Error.captureStackTrace&&Error.captureStackTrace(this,N);return r.code=t,e&&(this.message=this.message+": "+e),r}function E(){}function C(t,e){this._node=t,this._refresh=e,P(this)}function P(t){var e=t._node._inc||t._node.ownerDocument._inc;if(t._inc!=e){var r=t._refresh(t._node);ot(t,"length",r.length),n(r,t),t._inc=e}}function I(){}function D(t,e){for(var r=t.length;r--;)if(t[r]===e)return r}function A(t,e,r,n){if(n?e[D(e,n)]=r:e[e.length++]=r,t){r.ownerElement=t;var o=t.ownerDocument;o&&(n&&F(o,t,n),function(t,e,r){t&&t._inc++;var n=r.namespaceURI;"http://www.w3.org/2000/xmlns/"==n&&(e._nsMap[r.prefix?r.localName:""]=r.value)}(o,t,r))}}function S(t,e,r){var n=D(e,r);if(!(n>=0))throw N(b,new Error(t.tagName+"@"+r));for(var o=e.length-1;n<o;)e[n]=e[++n];if(e.length=o,t){var a=t.ownerDocument;a&&(F(a,t,r),r.ownerElement=null)}}function R(t){if(this._features={},t)for(var e in t)this._features=t[e]}function k(){}function O(t){return("<"==t?"&lt;":">"==t&&"&gt;")||"&"==t&&"&amp;"||'"'==t&&"&quot;"||"&#"+t.charCodeAt()+";"}function _(t,e){if(e(t))return!0;if(t=t.firstChild)do{if(_(t,e))return!0}while(t=t.nextSibling)}function M(){}function F(t,e,r,n){t&&t._inc++,"http://www.w3.org/2000/xmlns/"==r.namespaceURI&&delete e._nsMap[r.prefix?r.localName:""]}function L(t,e,r){if(t&&t._inc){t._inc++;var n=e.childNodes;if(r)n[n.length++]=r;else{for(var o=e.firstChild,a=0;o;)n[a++]=o,o=o.nextSibling;n.length=a}}}function j(t,e){var r=e.previousSibling,n=e.nextSibling;return r?r.nextSibling=n:t.firstChild=n,n?n.previousSibling=r:t.lastChild=r,L(t.ownerDocument,t),e}function X(t,e,r){var n=e.parentNode;if(n&&n.removeChild(e),e.nodeType===g){var o=e.firstChild;if(null==o)return e;var a=e.lastChild}else o=a=e;var i=r?r.previousSibling:t.lastChild;o.previousSibling=i,a.nextSibling=r,i?i.nextSibling=o:t.firstChild=o,null==r?t.lastChild=a:r.previousSibling=a;do{o.parentNode=t}while(o!==a&&(o=o.nextSibling));return L(t.ownerDocument||t,t),e.nodeType==g&&(e.firstChild=e.lastChild=null),e}function V(){this._nsMap={}}function U(){}function z(){}function B(){}function $(){}function G(){}function q(){}function W(){}function H(){}function Y(){}function Z(){}function J(){}function Q(){}function K(t,e){var r=[],n=9==this.nodeType?this.documentElement:this,o=n.prefix,a=n.namespaceURI;if(a&&null==o&&null==(o=n.lookupPrefix(a)))var i=[{namespace:a,prefix:null}];return et(this,r,t,e,i),r.join("")}function tt(t,e,r){var n=t.prefix||"",o=t.namespaceURI;if(!n&&!o)return!1;if("xml"===n&&"http://www.w3.org/XML/1998/namespace"===o||"http://www.w3.org/2000/xmlns/"==o)return!1;for(var a=r.length;a--;){var i=r[a];if(i.prefix==n)return i.namespace!=o}return!0}function et(t,e,r,n,o){if(n){if(!(t=n(t)))return;if("string"==typeof t)return void e.push(t)}switch(t.nodeType){case i:o||(o=[]);o.length;var a=t.attributes,p=a.length,v=t.firstChild,x=t.tagName;r="http://www.w3.org/1999/xhtml"===t.namespaceURI||r,e.push("<",x);for(var y=0;y<p;y++){"xmlns"==(w=a.item(y)).prefix?o.push({prefix:w.localName,namespace:w.value}):"xmlns"==w.nodeName&&o.push({prefix:"",namespace:w.value})}for(y=0;y<p;y++){var w;if(tt(w=a.item(y),0,o)){var b=w.prefix||"",T=w.namespaceURI,N=b?" xmlns:"+b:" xmlns";e.push(N,'="',T,'"'),o.push({prefix:b,namespace:T})}et(w,e,r,n,o)}if(tt(t,0,o)){b=t.prefix||"",T=t.namespaceURI,N=b?" xmlns:"+b:" xmlns";e.push(N,'="',T,'"'),o.push({prefix:b,namespace:T})}if(v||r&&!/^(?:meta|link|img|br|hr|input)$/i.test(x)){if(e.push(">"),r&&/^script$/i.test(x))for(;v;)v.data?e.push(v.data):et(v,e,r,n,o),v=v.nextSibling;else for(;v;)et(v,e,r,n,o),v=v.nextSibling;e.push("</",x,">")}else e.push("/>");return;case d:case g:for(v=t.firstChild;v;)et(v,e,r,n,o),v=v.nextSibling;return;case s:return e.push(" ",t.name,'="',t.value.replace(/[<&"]/g,O),'"');case u:return e.push(t.data.replace(/[<&]/g,O));case l:return e.push("<![CDATA[",t.data,"]]>");case h:return e.push("\x3c!--",t.data,"--\x3e");case m:var E=t.publicId,C=t.systemId;if(e.push("<!DOCTYPE ",t.name),E)e.push(' PUBLIC "',E),C&&"."!=C&&e.push('" "',C),e.push('">');else if(C&&"."!=C)e.push(' SYSTEM "',C,'">');else{var P=t.internalSubset;P&&e.push(" [",P,"]"),e.push(">")}return;case f:return e.push("<?",t.target," ",t.data,"?>");case c:return e.push("&",t.nodeName,";");default:e.push("??",t.nodeName)}}function rt(t,e,r){var n;switch(e.nodeType){case i:(n=e.cloneNode(!1)).ownerDocument=t;case g:break;case s:r=!0}if(n||(n=e.cloneNode(!1)),n.ownerDocument=t,n.parentNode=null,r)for(var o=e.firstChild;o;)n.appendChild(rt(t,o,r)),o=o.nextSibling;return n}function nt(t,e,r){var n=new e.constructor;for(var o in e){var a=e[o];"object"!=typeof a&&a!=n[o]&&(n[o]=a)}switch(e.childNodes&&(n.childNodes=new E),n.ownerDocument=t,n.nodeType){case i:var u=e.attributes,l=n.attributes=new I,c=u.length;l._ownerElement=n;for(var p=0;p<c;p++)n.setAttributeNode(nt(t,u.item(p),!0));break;case s:r=!0}if(r)for(var f=e.firstChild;f;)n.appendChild(nt(t,f,r)),f=f.nextSibling;return n}function ot(t,e,r){t[e]=r}N.prototype=Error.prototype,n(x,N),E.prototype={length:0,item:function(t){return this[t]||null},toString:function(t,e){for(var r=[],n=0;n<this.length;n++)et(this[n],r,t,e);return r.join("")}},C.prototype.item=function(t){return P(this),this[t]},o(C,E),I.prototype={length:0,item:E.prototype.item,getNamedItem:function(t){for(var e=this.length;e--;){var r=this[e];if(r.nodeName==t)return r}},setNamedItem:function(t){var e=t.ownerElement;if(e&&e!=this._ownerElement)throw new N(T);var r=this.getNamedItem(t.nodeName);return A(this._ownerElement,this,t,r),r},setNamedItemNS:function(t){var e,r=t.ownerElement;if(r&&r!=this._ownerElement)throw new N(T);return e=this.getNamedItemNS(t.namespaceURI,t.localName),A(this._ownerElement,this,t,e),e},removeNamedItem:function(t){var e=this.getNamedItem(t);return S(this._ownerElement,this,e),e},removeNamedItemNS:function(t,e){var r=this.getNamedItemNS(t,e);return S(this._ownerElement,this,r),r},getNamedItemNS:function(t,e){for(var r=this.length;r--;){var n=this[r];if(n.localName==e&&n.namespaceURI==t)return n}return null}},R.prototype={hasFeature:function(t,e){var r=this._features[t.toLowerCase()];return!(!r||e&&!(e in r))},createDocument:function(t,e,r){var n=new M;if(n.implementation=this,n.childNodes=new E,n.doctype=r,r&&n.appendChild(r),e){var o=n.createElementNS(t,e);n.appendChild(o)}return n},createDocumentType:function(t,e,r){var n=new q;return n.name=t,n.nodeName=t,n.publicId=e,n.systemId=r,n}},k.prototype={firstChild:null,lastChild:null,previousSibling:null,nextSibling:null,attributes:null,parentNode:null,childNodes:null,ownerDocument:null,nodeValue:null,namespaceURI:null,prefix:null,localName:null,insertBefore:function(t,e){return X(this,t,e)},replaceChild:function(t,e){this.insertBefore(t,e),e&&this.removeChild(e)},removeChild:function(t){return j(this,t)},appendChild:function(t){return this.insertBefore(t,null)},hasChildNodes:function(){return null!=this.firstChild},cloneNode:function(t){return nt(this.ownerDocument||this,this,t)},normalize:function(){for(var t=this.firstChild;t;){var e=t.nextSibling;e&&e.nodeType==u&&t.nodeType==u?(this.removeChild(e),t.appendData(e.data)):(t.normalize(),t=e)}},isSupported:function(t,e){return this.ownerDocument.implementation.hasFeature(t,e)},hasAttributes:function(){return this.attributes.length>0},lookupPrefix:function(t){for(var e=this;e;){var r=e._nsMap;if(r)for(var n in r)if(r[n]==t)return n;e=e.nodeType==s?e.ownerDocument:e.parentNode}return null},lookupNamespaceURI:function(t){for(var e=this;e;){var r=e._nsMap;if(r&&t in r)return r[t];e=e.nodeType==s?e.ownerDocument:e.parentNode}return null},isDefaultNamespace:function(t){return null==this.lookupPrefix(t)}},n(a,k),n(a,k.prototype),M.prototype={nodeName:"#document",nodeType:d,doctype:null,documentElement:null,_inc:1,insertBefore:function(t,e){if(t.nodeType==g){for(var r=t.firstChild;r;){var n=r.nextSibling;this.insertBefore(r,e),r=n}return t}return null==this.documentElement&&t.nodeType==i&&(this.documentElement=t),X(this,t,e),t.ownerDocument=this,t},removeChild:function(t){return this.documentElement==t&&(this.documentElement=null),j(this,t)},importNode:function(t,e){return rt(this,t,e)},getElementById:function(t){var e=null;return _(this.documentElement,(function(r){if(r.nodeType==i&&r.getAttribute("id")==t)return e=r,!0})),e},createElement:function(t){var e=new V;return e.ownerDocument=this,e.nodeName=t,e.tagName=t,e.childNodes=new E,(e.attributes=new I)._ownerElement=e,e},createDocumentFragment:function(){var t=new Z;return t.ownerDocument=this,t.childNodes=new E,t},createTextNode:function(t){var e=new B;return e.ownerDocument=this,e.appendData(t),e},createComment:function(t){var e=new $;return e.ownerDocument=this,e.appendData(t),e},createCDATASection:function(t){var e=new G;return e.ownerDocument=this,e.appendData(t),e},createProcessingInstruction:function(t,e){var r=new J;return r.ownerDocument=this,r.tagName=r.target=t,r.nodeValue=r.data=e,r},createAttribute:function(t){var e=new U;return e.ownerDocument=this,e.name=t,e.nodeName=t,e.localName=t,e.specified=!0,e},createEntityReference:function(t){var e=new Y;return e.ownerDocument=this,e.nodeName=t,e},createElementNS:function(t,e){var r=new V,n=e.split(":"),o=r.attributes=new I;return r.childNodes=new E,r.ownerDocument=this,r.nodeName=e,r.tagName=e,r.namespaceURI=t,2==n.length?(r.prefix=n[0],r.localName=n[1]):r.localName=e,o._ownerElement=r,r},createAttributeNS:function(t,e){var r=new U,n=e.split(":");return r.ownerDocument=this,r.nodeName=e,r.name=e,r.namespaceURI=t,r.specified=!0,2==n.length?(r.prefix=n[0],r.localName=n[1]):r.localName=e,r}},o(M,k),V.prototype={nodeType:i,hasAttribute:function(t){return null!=this.getAttributeNode(t)},getAttribute:function(t){var e=this.getAttributeNode(t);return e&&e.value||""},getAttributeNode:function(t){return this.attributes.getNamedItem(t)},setAttribute:function(t,e){var r=this.ownerDocument.createAttribute(t);r.value=r.nodeValue=""+e,this.setAttributeNode(r)},removeAttribute:function(t){var e=this.getAttributeNode(t);e&&this.removeAttributeNode(e)},appendChild:function(t){return t.nodeType===g?this.insertBefore(t,null):function(t,e){var r=e.parentNode;if(r){var n=t.lastChild;r.removeChild(e),n=t.lastChild}return n=t.lastChild,e.parentNode=t,e.previousSibling=n,e.nextSibling=null,n?n.nextSibling=e:t.firstChild=e,t.lastChild=e,L(t.ownerDocument,t,e),e}(this,t)},setAttributeNode:function(t){return this.attributes.setNamedItem(t)},setAttributeNodeNS:function(t){return this.attributes.setNamedItemNS(t)},removeAttributeNode:function(t){return this.attributes.removeNamedItem(t.nodeName)},removeAttributeNS:function(t,e){var r=this.getAttributeNodeNS(t,e);r&&this.removeAttributeNode(r)},hasAttributeNS:function(t,e){return null!=this.getAttributeNodeNS(t,e)},getAttributeNS:function(t,e){var r=this.getAttributeNodeNS(t,e);return r&&r.value||""},setAttributeNS:function(t,e,r){var n=this.ownerDocument.createAttributeNS(t,e);n.value=n.nodeValue=""+r,this.setAttributeNode(n)},getAttributeNodeNS:function(t,e){return this.attributes.getNamedItemNS(t,e)},getElementsByTagName:function(t){return new C(this,(function(e){var r=[];return _(e,(function(n){n===e||n.nodeType!=i||"*"!==t&&n.tagName!=t||r.push(n)})),r}))},getElementsByTagNameNS:function(t,e){return new C(this,(function(r){var n=[];return _(r,(function(o){o===r||o.nodeType!==i||"*"!==t&&o.namespaceURI!==t||"*"!==e&&o.localName!=e||n.push(o)})),n}))}},M.prototype.getElementsByTagName=V.prototype.getElementsByTagName,M.prototype.getElementsByTagNameNS=V.prototype.getElementsByTagNameNS,o(V,k),U.prototype.nodeType=s,o(U,k),z.prototype={data:"",substringData:function(t,e){return this.data.substring(t,t+e)},appendData:function(t){t=this.data+t,this.nodeValue=this.data=t,this.length=t.length},insertData:function(t,e){this.replaceData(t,0,e)},appendChild:function(t){throw new Error(y[w])},deleteData:function(t,e){this.replaceData(t,e,"")},replaceData:function(t,e,r){r=this.data.substring(0,t)+r+this.data.substring(t+e),this.nodeValue=this.data=r,this.length=r.length}},o(z,k),B.prototype={nodeName:"#text",nodeType:u,splitText:function(t){var e=this.data,r=e.substring(t);e=e.substring(0,t),this.data=this.nodeValue=e,this.length=e.length;var n=this.ownerDocument.createTextNode(r);return this.parentNode&&this.parentNode.insertBefore(n,this.nextSibling),n}},o(B,z),$.prototype={nodeName:"#comment",nodeType:h},o($,z),G.prototype={nodeName:"#cdata-section",nodeType:l},o(G,z),q.prototype.nodeType=m,o(q,k),W.prototype.nodeType=v,o(W,k),H.prototype.nodeType=p,o(H,k),Y.prototype.nodeType=c,o(Y,k),Z.prototype.nodeName="#document-fragment",Z.prototype.nodeType=g,o(Z,k),J.prototype.nodeType=f,o(J,k),Q.prototype.serializeToString=function(t,e,r){return K.call(t,e,r)},k.prototype.toString=K;try{if(Object.defineProperty){function at(t){switch(t.nodeType){case i:case g:var e=[];for(t=t.firstChild;t;)7!==t.nodeType&&8!==t.nodeType&&e.push(at(t)),t=t.nextSibling;return e.join("");default:return t.nodeValue}}Object.defineProperty(C.prototype,"length",{get:function(){return P(this),this.$$length}}),Object.defineProperty(k.prototype,"textContent",{get:function(){return at(this)},set:function(t){switch(this.nodeType){case i:case g:for(;this.firstChild;)this.removeChild(this.firstChild);(t||String(t))&&this.appendChild(this.ownerDocument.createTextNode(t));break;default:this.data=t,this.value=t,this.nodeValue=t}}}),ot=function(t,e,r){t["$$"+e]=r}}}catch(it){}r.DOMImplementation=R,r.XMLSerializer=Q},{}],27:[function(t,e,r){var n=/[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,o=new RegExp("[\\-\\.0-9"+n.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"),a=new RegExp("^"+n.source+o.source+"*(?::"+n.source+o.source+"*)?$");function i(){}function s(t,e){return e.lineNumber=t.lineNumber,e.columnNumber=t.columnNumber,e}function u(t,e,r,n,o,a){for(var i,s=++e,u=0;;){var l=t.charAt(s);switch(l){case"=":if(1===u)i=t.slice(e,s),u=3;else{if(2!==u)throw new Error("attribute equal must after attrName");u=3}break;case"'":case'"':if(3===u||1===u){if(1===u&&(a.warning('attribute value must after "="'),i=t.slice(e,s)),e=s+1,!((s=t.indexOf(l,e))>0))throw new Error("attribute value no end '"+l+"' match");c=t.slice(e,s).replace(/&#?\w+;/g,o),r.add(i,c,e-1),u=5}else{if(4!=u)throw new Error('attribute value must after "="');c=t.slice(e,s).replace(/&#?\w+;/g,o),r.add(i,c,e),a.warning('attribute "'+i+'" missed start quot('+l+")!!"),e=s+1,u=5}break;case"/":switch(u){case 0:r.setTagName(t.slice(e,s));case 5:case 6:case 7:u=7,r.closed=!0;case 4:case 1:case 2:break;default:throw new Error("attribute invalid close char('/')")}break;case"":return a.error("unexpected end of input"),0==u&&r.setTagName(t.slice(e,s)),s;case">":switch(u){case 0:r.setTagName(t.slice(e,s));case 5:case 6:case 7:break;case 4:case 1:"/"===(c=t.slice(e,s)).slice(-1)&&(r.closed=!0,c=c.slice(0,-1));case 2:2===u&&(c=i),4==u?(a.warning('attribute "'+c+'" missed quot(")!!'),r.add(i,c.replace(/&#?\w+;/g,o),e)):("http://www.w3.org/1999/xhtml"===n[""]&&c.match(/^(?:disabled|checked|selected)$/i)||a.warning('attribute "'+c+'" missed value!! "'+c+'" instead!!'),r.add(c,c,e));break;case 3:throw new Error("attribute value missed!!")}return s;case"":l=" ";default:if(l<=" ")switch(u){case 0:r.setTagName(t.slice(e,s)),u=6;break;case 1:i=t.slice(e,s),u=2;break;case 4:var c=t.slice(e,s).replace(/&#?\w+;/g,o);a.warning('attribute "'+c+'" missed quot(")!!'),r.add(i,c,e);case 5:u=6}else switch(u){case 2:r.tagName;"http://www.w3.org/1999/xhtml"===n[""]&&i.match(/^(?:disabled|checked|selected)$/i)||a.warning('attribute "'+i+'" missed value!! "'+i+'" instead2!!'),r.add(i,i,e),e=s,u=1;break;case 5:a.warning('attribute space is required"'+i+'"!!');case 6:u=1,e=s;break;case 3:u=4,e=s;break;case 7:throw new Error("elements closed character '/' and '>' must be connected to")}}s++}}function l(t,e,r){for(var n=t.tagName,o=null,a=t.length;a--;){var i=t[a],s=i.qName,u=i.value;if((h=s.indexOf(":"))>0)var l=i.prefix=s.slice(0,h),c=s.slice(h+1),p="xmlns"===l&&c;else c=s,l=null,p="xmlns"===s&&"";i.localName=c,!1!==p&&(null==o&&(o={},f(r,r={})),r[p]=o[p]=u,i.uri="http://www.w3.org/2000/xmlns/",e.startPrefixMapping(p,u))}for(a=t.length;a--;){(l=(i=t[a]).prefix)&&("xml"===l&&(i.uri="http://www.w3.org/XML/1998/namespace"),"xmlns"!==l&&(i.uri=r[l||""]))}var h;(h=n.indexOf(":"))>0?(l=t.prefix=n.slice(0,h),c=t.localName=n.slice(h+1)):(l=null,c=t.localName=n);var d=t.uri=r[l||""];if(e.startElement(d,c,n,t),!t.closed)return t.currentNSMap=r,t.localNSMap=o,!0;if(e.endElement(d,c,n),o)for(l in o)e.endPrefixMapping(l)}function c(t,e,r,n,o){if(/^(?:script|textarea)$/i.test(r)){var a=t.indexOf("</"+r+">",e),i=t.substring(e+1,a);if(/[&<]/.test(i))return/^script$/i.test(r)?(o.characters(i,0,i.length),a):(i=i.replace(/&#?\w+;/g,n),o.characters(i,0,i.length),a)}return e+1}function p(t,e,r,n){var o=n[r];return null==o&&((o=t.lastIndexOf("</"+r+">"))<e&&(o=t.lastIndexOf("</"+r)),n[r]=o),o<e}function f(t,e){for(var r in t)e[r]=t[r]}function h(t,e,r,n){if("-"===t.charAt(e+2))return"-"===t.charAt(e+3)?(o=t.indexOf("--\x3e",e+4))>e?(r.comment(t,e+4,o-e-4),o+3):(n.error("Unclosed comment"),-1):-1;if("CDATA["==t.substr(e+3,6)){var o=t.indexOf("]]>",e+9);return r.startCDATA(),r.characters(t,e+9,o-e-9),r.endCDATA(),o+3}var a=function(t,e){var r,n=[],o=/'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;o.lastIndex=e,o.exec(t);for(;r=o.exec(t);)if(n.push(r),r[1])return n}(t,e),i=a.length;if(i>1&&/!doctype/i.test(a[0][0])){var s=a[1][0],u=i>3&&/^public$/i.test(a[2][0])&&a[3][0],l=i>4&&a[4][0],c=a[i-1];return r.startDTD(s,u&&u.replace(/^(['"])(.*?)\1$/,"$2"),l&&l.replace(/^(['"])(.*?)\1$/,"$2")),r.endDTD(),c.index+c[0].length}return-1}function d(t,e,r){var n=t.indexOf("?>",e);if(n){var o=t.substring(e,n).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);if(o){o[0].length;return r.processingInstruction(o[1],o[2]),n+2}return-1}return-1}function m(t){}function g(t,e){return t.__proto__=e,t}i.prototype={parse:function(t,e,r){var n=this.domBuilder;n.startDocument(),f(e,e={}),function(t,e,r,n,o){function a(t){if(t>65535){var e=55296+((t-=65536)>>10),r=56320+(1023&t);return String.fromCharCode(e,r)}return String.fromCharCode(t)}function i(t){var e=t.slice(1,-1);return e in r?r[e]:"#"===e.charAt(0)?a(parseInt(e.substr(1).replace("x","0x"))):(o.error("entity not found:"+t),t)}function f(e){if(e>N){var r=t.substring(N,e).replace(/&#?\w+;/g,i);w&&g(N),n.characters(r,0,e-N),N=e}}function g(e,r){for(;e>=x&&(r=y.exec(t));)v=r.index,x=v+r[0].length,w.lineNumber++;w.columnNumber=e-v+1}var v=0,x=0,y=/.*(?:\r\n?|\n)|.*$/g,w=n.locator,b=[{currentNSMap:e}],T={},N=0;for(;;){try{var E=t.indexOf("<",N);if(E<0){if(!t.substr(N).match(/^\s*$/)){var C=n.doc,P=C.createTextNode(t.substr(N));C.appendChild(P),n.currentElement=P}return}switch(E>N&&f(E),t.charAt(E+1)){case"/":var I=t.indexOf(">",E+3),D=t.substring(E+2,I),A=b.pop();I<0?(D=t.substring(E+2).replace(/[\s<].*/,""),o.error("end tag name: "+D+" is not complete:"+A.tagName),I=E+1+D.length):D.match(/\s</)&&(D=D.replace(/[\s<].*/,""),o.error("end tag name: "+D+" maybe not complete"),I=E+1+D.length);var S=A.localNSMap,R=A.tagName==D;if(R||A.tagName&&A.tagName.toLowerCase()==D.toLowerCase()){if(n.endElement(A.uri,A.localName,D),S)for(var k in S)n.endPrefixMapping(k);R||o.fatalError("end tag name: "+D+" is not match the current start tagName:"+A.tagName)}else b.push(A);I++;break;case"?":w&&g(E),I=d(t,E,n);break;case"!":w&&g(E),I=h(t,E,n,o);break;default:w&&g(E);var O=new m,_=b[b.length-1].currentNSMap,M=(I=u(t,E,O,_,i,o),O.length);if(!O.closed&&p(t,I,O.tagName,T)&&(O.closed=!0,r.nbsp||o.warning("unclosed xml attribute")),w&&M){for(var F=s(w,{}),L=0;L<M;L++){var j=O[L];g(j.offset),j.locator=s(w,{})}n.locator=F,l(O,n,_)&&b.push(O),n.locator=w}else l(O,n,_)&&b.push(O);"http://www.w3.org/1999/xhtml"!==O.uri||O.closed?I++:I=c(t,I,O.tagName,i,n)}}catch(t){o.error("element parse error: "+t),I=-1}I>N?N=I:f(Math.max(E,N)+1)}}(t,e,r,n,this.errorHandler),n.endDocument()}},m.prototype={setTagName:function(t){if(!a.test(t))throw new Error("invalid tagName:"+t);this.tagName=t},add:function(t,e,r){if(!a.test(t))throw new Error("invalid attribute:"+t);this[this.length++]={qName:t,value:e,offset:r}},length:0,getLocalName:function(t){return this[t].localName},getLocator:function(t){return this[t].locator},getQName:function(t){return this[t].qName},getURI:function(t){return this[t].uri},getValue:function(t){return this[t].value}},g({},g.prototype)instanceof g||(g=function(t,e){function r(){}for(e in r.prototype=e,r=new r,t)r[e]=t[e];return r}),r.XMLReader=i},{}]},{},[])("/js/index.js")}));
//# sourceMappingURL=/sm/5e148cca85d22ecf3aa5af9383a6f2b0ccefa9c12e242d9b75b36a3f4b7c000e.map