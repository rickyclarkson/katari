/**
 * Base canvas social container.
 * This library requires jquery 1.4.2. 
 * 
 * @author waabox (emiliano[dot]arango[at]globant[dot]com)
 */

var KATARI = KATARI || {};
KATARI.SOCIAL = KATARI.SOCIAL|| {};
KATARI.SOCIAL.canvasConfig = KATARI.SOCIAL.canvasConfig || {};

// This will be configured by the CanvasBuilder.
KATARI.debugMode = false;
KATARI.SOCIAL.canvasConfig.host = "http://localhost:8098/katari-sample";
KATARI.SOCIAL.canvasConfig.container = KATARI.SOCIAL.canvasConfig.host + "/module/shindig/gadgets/ifr";
KATARI.SOCIAL.canvasConfig.relayFile = KATARI.SOCIAL.canvasConfig.host + "/gadgets/files/container/rpc_relay.html";
KATARI.SOCIAL.canvasConfig.rpcToken = "rpcToken";
KATARI.SOCIAL.canvasConfig.applicationPrefix = "Application_";
KATARI.SOCIAL.canvasConfig.socialContainer = "default";
KATARI.SOCIAL.canvasConfig.defaultView = "default";
KATARI.SOCIAL.canvasConfig.synId = "0";

KATARI.Console = {
  log : function(objLog) {
    if(KATARI.debugMode) {
      try {
        console.log(objLog);
      } catch(e){
      }
    }
  }
};

/**
 * @param sId
 * @param sUrl
 * @param sSecurityToken
 * @param sViewer
 * @param sOwner
 * @param sPosition
 * 
 */
KATARI.SOCIAL.GadgetInstance = function(sId, sUrl, sSecurityToken, sViewer, sOwner, sPosition) {
  
  this.id = sId;
  this.gadgetContainerUrl = KATARI.SOCIAL.canvasConfig.container;
  this.rpcToken = KATARI.SOCIAL.canvasConfig.rpcToken;
  this.url = sUrl;
  this.token = sSecurityToken;
  this.container = KATARI.SOCIAL.canvasConfig.socialContainer;
  this.synId = KATARI.SOCIAL.canvasConfig.synId;
  this.viewer = sViewer;
  this.owner = sOwner;
  this.position = sPosition;
  this.view = KATARI.SOCIAL.canvasConfig.defaultView;
  this.parent = KATARI.SOCIAL.canvasConfig.host;
  
  this.buildGadgetUrl = function() {
    var url = [];
    url.push(this.gadgetContainerUrl);
    url.push("?url=", sUrl);
    url.push("#rpctoken=", this.rpcToken);
    url.push("&st=", this.token);
    url.push("&mid=", this.rpcToken);
    url.push("&synd=", this.synId);
    url.push("&container=", this.container);
    url.push("&viewer=", this.viewer);
    url.push("&owner=", this.owner);
    url.push("&aid=", this.id);
    url.push("&parent=", this.parent);
    url.push("&view=", this.view);
    return url.join('');
  };
};
/**
 * Create a new social canvas.
 * 
 * @param {String} sContainer id of the container.
 */
KATARI.SOCIAL.Canvas = function(sContainer, iColumns) {
  this.gadgets = [];
  var container = sContainer;
  var columns = [];
  var POSITION_SPLITTER = '#';
  
  for (var i = 1; i <= iColumns; i++) {
    columns[i] = $('<div class="canvasColumn">');
  }

  /**
   * Add a gadget instance.
   * @param {Object} objGadgetInstance
   * return this.
   */
  this.addGadget = function(objGadgetInstance) {
    this.gadgets.push(objGadgetInstance);
    return this;
  };
  
  /**
   * 
   * @param {Object} objJson
   */
  this.addGadgetsFromJson = function(objJson) {
    for(m in objJson.gadgets) {
      var obj = objJson.gadgets[m];
      this.addGadget(new KATARI.SOCIAL.GadgetInstance(obj.id, obj.url, obj.securityToken, 
          obj.viewer, obj.owner, obj.gadgetPosition)
      );    
    }
    return this;
  };
  /**
   * Creates the application name.
   * 
   * @param GadgetInstance gadgetInstance.
   */
  this.createApplicationId = function(oGadgetInstance) {
    return KATARI.SOCIAL.canvasConfig.applicationPrefix + oGadgetInstance.id;
  };
  /**
   * Render the canvas
   * return void
   */
  this.render = function() {
    // sort the gadgets.
    this.gadgets.sort(
      function(a, b) {
        var positionA = a.gadgetPosition.split(POSITION_SPLITTER);
        var positionB = b.gadgetPosition.split(POSITION_SPLITTER);
        if(positionA[0] == positionB[0]) {
          if(positionA[1] > positionB[1]) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if(positionA[0] > positionB[0]) {
            return 1;
          } else {
            return -1;
          }
        }
      }
    );
    KATARI.Console.log(this.gadgets);
    // add the gadgets
    for (i in this.gadgets) {
      var theGadget = this.gadgets[i];
      var iFrame = $("<iframe>");
      var theId = this.createApplicationId(theGadget);
      iFrame.attr("src", theGadget.buildGadgetUrl());
      iFrame.attr("id", theId);
      iFrame.attr("name", theId);
      
      var titleDiv = $("<div></div>");
      titleDiv.attr("id", "header_" + theGadget.id)
      var localDiv = $("<div>");
      
      localDiv.append(iFrame);
      
      var position = theGadget.position.split(POSITION_SPLITTER);
      columns[position[0]].append(titleDiv);
      columns[position[0]].append(localDiv);
    }
    
    var containerDiv = $('<div>');
    
    for (item in columns) {
      containerDiv.append(columns[item]);
    }
    
    var canvasContainer = $('<div class="canvasContainer">').append(containerDiv);
    $('#' + container).append(canvasContainer);
  
    if (window.gadgets) { 
      for (i in this.gadgets) {
        var appId = this.createApplicationId(this.gadgets[i]);
        gadgets.rpc.setRelayUrl(appId, KATARI.SOCIAL.canvasConfig.relayFile);
        gadgets.rpc.setAuthToken(appId, KATARI.SOCIAL.canvasConfig.rpcToken);
      }
    }
    
  };
};

/**
 * OpenSocial container implementation.
 * 
 */
KATARI.SOCIAL.Container = function() {
  
  this.maxHeight = 4096;
  
  gadgets.rpc.register('resize_iframe', this.setHeight);
  gadgets.rpc.register('set_pref', this.setUserPref);
  gadgets.rpc.register('set_title', this.setTitle);
  gadgets.rpc.register('requestNavigateTo', this.requestNavigateTo);

};

KATARI.SOCIAL.Container.prototype.setHeight = function(height) {
  if (height > gadgets.container.maxHeight) {
    height = gadgets.container.maxHeight;
  }
  var element = document.getElementById(this.f);
  if (element) {
    element.height = height;
  }
};

KATARI.SOCIAL.Container.prototype.setTitle = function(title) {
  var element = $('#header_' + this.f);
  if (element != undefined) {
    element.text(title.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
  }
};

KATARI.SOCIAL.Container.prototype._parseIframeUrl = function(url) {
  var ret = new Object();
  var hashParams = url.replace(/#.*$/, '').split('&');
  var param = key = val = '';
  for (i = 0; i < hashParams.length; i++) {
    param = hashParams[i];
    key = param.substr(0, param.indexOf('='));
    val = param.substr(param.indexOf('=') + 1);
    ret[key] = val;
  }
  return ret;
};

KATARI.SOCIAL.Container.prototype.setUserPref = function(editToken, name, value) {
  if ($(this.f) != undefined) {
    var params = gadgets.container._parseIframeUrl($(this.f).src);
    new Ajax.Request('/prefs/set', {
      method : 'get',
      parameters : {
        name : name,
        value : value,
        st : params.st
      }
    });
  }
};

KATARI.SOCIAL.Container.prototype._getUrlForView = function(view, person, app, mod) {
  if (view === 'home') {
    return '/home';
  } else if (view === 'profile') {
    return '/profile/' + person;
  } else if (view === 'canvas') {
    return '/profile/application/' + person + '/' + app + '/' + mod;
  } else {
    return null;
  }
};

KATARI.SOCIAL.Container.prototype.requestNavigateTo = function(view, opt_params) {
  if ($(this.f) != undefined) {
    var params = gadgets.container._parseIframeUrl($(this.f).src);
    var url = gadgets.container._getUrlForView(view, params.owner, params.aid,
        params.mid);
    if (opt_params) {
      var paramStr = Object.toJSON(opt_params);
      if (paramStr.length > 0) {
        url += '?appParams=' + encodeURIComponent(paramStr);
      }
    }
    if (url && document.location.href.indexOf(url) == -1) {
      document.location.href = url;
    }
  }
};

$(document).ready(function() {
  gadgets.container = new KATARI.SOCIAL.Container();
});

$.extend({
  getUrlVars: function(){
    var vars = [];
    var hash = [];
    var hashes = window.location.href.slice(
        window.location.href.indexOf('?') + 1).split('&');
    
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  },
  getWindowLocation : function() {
   return window.location.href;
  }
});
