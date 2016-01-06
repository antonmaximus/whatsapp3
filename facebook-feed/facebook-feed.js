define(['comp/graphicComp', 'utils/domUtils', 'utils/objectUtils'],

    function(graphicComp, domUtils, objectUtils) {
        /*jshint validthis: true */
        'use strict';

        var _templates = {
            holder: '<div style="position: relative; width: 100%; height: 100%;"><%=overlayBox %><%=ulWrapper %></div>',
            overlayBox: '<div id="overlayBox" style="position: absolute; <%=overlayPosition %>: 0; height: <%=overlayHeight %>; width: 100%; background: rgba(<%=overlayColor %>, 1); text-align: right; "><a id="fbook-page" style="text-decoration: none;" href="<%=fbookPageLink %>"><div style="background: <%=buttonColor %>; color: <%=buttonTextColor %>; font-size: <%=buttonTextFontSize %>; width: <%=buttonWidth %>; height: <%=buttonHeight %>; line-height: <%=buttonHeight %>; top: <%=buttonPositionTop %>; right: <%=buttonPositionRight %>; font-family: <%=buttonTextFontFamily %>; display: inline-block; overflow: hidden; text-align: center; position: relative; border-radius: 6px;"><%=buttonText %></div></a></div>',
            li: '<li data-fbpost="<%=fbpostLink %>"> <div class="feed-item" style="width: 100%; padding: 4px 0 2px 0; border-bottom: 1px solid <%=separatorColor %>; cursor: pointer;"> <img src="<%=picture %>" style="width: <%=thumbPercentSize %>; margin-left: 2px; margin-top: 2px;"/> <div style="width: <%=textPercentSize %>; vertical-align: top; display: inline-block; word-wrap: break-word; margin-left: 3px; "> <span><%=message %></span> <br/> <a href="<%=articleLink %>" target="_blank" style="color: <%=linkColor %>; text-decoration: underline; cursor: pointer;"> <%=articleLink %> </a><span style="text-align: right; display: block; vertical-align: bottom; margin-right: 5px; color: <%=timestampColor %>;"><%=timestamp %></span> </div></div></li>',
            liNoThumb: '<li data-fbpost="<%=fbpostLink %>"> <div class="feed-item" style="width: 100%; padding: 4px 0 2px 0; border-bottom: 1px solid <%=separatorColor %>; cursor: pointer;"> <div style="width: 100%; vertical-align: top; display: inline-block; word-wrap: break-word; margin-left: 0; "> <span><%=message %></span> <br/> <a href="<%=articleLink %>" target="_blank" style="color: <%=linkColor %>; text-decoration: underline; cursor: pointer;"> <%=articleLink %> </a><span style="text-align: right; display: block; vertical-align: bottom; color: <%=timestampColor %>;"><%=timestamp %></span> </div></div></li>',
            ul: '<ul style="list-style: none; padding: 0; margin: 0; background-color:<%=feedBackgroundColor %>;"><%=li %></ul>',
            ulWrapper: '<div id="ulWrapper" style="overflow-y: scroll; overflow-x: none; position:<%=ulWrapperPos %>; top:<%=overlayHeight %>; height: <%=feedHeight %>;"><%=ul %></div>',
            imagePlaceHolder: '<div id="sz-placeholderImage" style="width: 100%; height: 100%; background:  url(<%=image %>); background-size: cover; cursor: pointer;"></div>',
        };
           
        var DEFAULT = {
            fontFamily: 'Arial',
            fontSize: 12,
            textColor: '#000000',
            linkColor: '#0000FF',
            separatorColor: '#DDDDDD',
            timestampColor: '#DDDDDD',
            feedBackgroundColor: 'transparent',
            thumbPercentSize: '15%',
            textPercentSize: '80%',
            overlayHeight: '32px',
            overlayColor: '#000000',
            overlayPosition: 'bottom',
            buttonColor: '#0052b1',
            buttonTextColor: '#FFFFFF',
            buttonTextFontSize: 11,
            buttonWidth: '100px',
            buttonHeight: '32px',
            buttonPositionTop: 0,
            buttonPositionRight: 0,
            buttonText: 'VISIT', 
            buttonTextFontFamily: 'Arial',
        };
            
        var FB_BASE_URL = 'https://www.facebook.com/';
        var ACCESS_TOKEN = '279915592145003|EzrYJeGR2WzRgpjf4hjYlaMv-yY'; // Access token should never change unless the FaceBook app is deleted or its app secret is updated.



        function FacebookFeedComp(properties) {
            graphicComp.call(this, properties);          
        }

        FacebookFeedComp.prototype = new graphicComp();

        FacebookFeedComp.prototype.addProperties = function() {
            graphicComp.prototype.addProperties.call(this);
            // you need to add this property otherwise it will not be parsed (css mesaure)
            if (!this.prop.fontSize){
                 this.prop.fontSize = DEFAULT.fontSize;
            }
            this.prop.facebookPageUrl = this.prop.facebookPageUrl.split('facebook.com/')[1];
        };

        FacebookFeedComp.prototype.internalDraw = function() {
            graphicComp.prototype.internalDraw.call(this);
            domUtils.applyStyle(this.div,{
                'font-family': (this.prop.fontFamily || DEFAULT.fontFamily) + "," + DEFAULT.fontFamily,
                'font-size': this.prop.fontSize + 'px',
                'color': (this.prop.textColor || DEFAULT.textColor)
            });
            this.div.innerHTML = buildTemplate.call(this, _templates.imagePlaceHolder, {
                image: this.prop.placeholderImage || ''
            });

                // Use placeholder image until user clicks on it.
                this.div.querySelector('#sz-placeholderImage').innerHTML = 'mmmmk';
        };

    
        FacebookFeedComp.getInputSchema = function(){
            return FacebookFeedComp.inputSchema;
        };

        FacebookFeedComp.inputSchema = objectUtils.create(graphicComp.inputSchema,{
            facebookPageUrl: null,
            placeholderImage: 'asset',
            showThumbs: 'boolean',
            fontFamily: null,
            fontSize: null,
            textColor: null,
            linkColor: null,
            separatorColor: null,
            timestampColor: null,
            feedBackgroundColor: null,
            thumbPercentSize: null,
            textPercentSize: null,
            overlayHeight: null,
            overlayColor: null,
            overlayPosition: null,
            buttonColor: null,
            buttonTextColor: null,
            buttonTextFontSize: null,
            buttonWidth: null,
            buttonHeight: null,
            buttonPositionTop: null,
            buttonPositionRight: null,
            buttonText: null, 
            buttonTextFontFamily: null,
        });

        function buildTemplate(str, data){
            return str.replace(/<%=.+? %>/g, function(token){
                var key = token.substring(3, token.length-3);
                return data[key];
            });
        }

        function createTimestamp(creation) {
            var date = new Date(creation.slice(0, -5) + 'Z'); //Use ISO 8601 format because IE9
            var currDate = new Date();
            var hours = Math.abs(currDate - date) / (60*60*1000);

            // If less than 24 hours, return number of hours since posting; otherwise, month + day
            return (hours < 24) ? Math.floor(hours) + 'h' : 
                date.toDateString().substring(4, 7) + ' ' + date.toDateString().substring(8, 10);
        }

        function drawFacebookFeed() {
            var busyIndicatorSize = 40;
            var loaderLocY = (this.div.offsetHeight / 2) - busyIndicatorSize/2 + 'px';
            var busyIndicator = this.getBusyIndicator(busyIndicatorSize);
            busyIndicator.style.cssText += "margin: auto; position: relative; top: " + loaderLocY + "; ";
            this.div.firstElementChild.appendChild(busyIndicator);

            var url = 'https://graph.facebook.com/v2.4/' + this.prop.facebookPageUrl + '/posts?access_token=' + ACCESS_TOKEN + '&fields=id,picture,message,link,icon,created_time';

            fetchFeedData.call(this, url, drawFeedElements);
        }

        function drawFeedElements(feedData) {
            var templateToUse = this.prop.showThumbs === true ? _templates.li : _templates.liNoThumb;
            var facebookPostLink = [];
            var feedEntries = '';

            feedData.forEach(function(item){
                var entry =  buildTemplate.call(this, templateToUse, {
                    picture: item.picture || 'https://graph.facebook.com/v2.4/' + this.prop.facebookPageUrl + '/picture?fields=url', 
                    message: item.message || '', 
                    articleLink: item.link || '',
                    fbpostLink: FB_BASE_URL + this.prop.facebookPageUrl + '/posts/' + item.id.split('_')[1] || '',
                    linkColor: this.prop.linkColor || DEFAULT.linkColor,
                    timestamp: createTimestamp(item.created_time) || '',
                    timestampColor: this.prop.timestampColor || DEFAULT.timestampColor,
                    separatorColor: this.prop.separatorColor || DEFAULT.separatorColor,
                    thumbPercentSize: this.prop.thumbnailPercentageSize || DEFAULT.thumbPercentSize,
                    textPercentSize: 95 - parseInt(this.prop.thumbnailPercentageSize) + '%' || DEFAULT.textPercentSize
                });
                feedEntries += entry;
            }.bind(this));

            var overlayColorRGB = hexToRgb(this.prop.overlayColor);
            var ul = buildTemplate.call(this, _templates.ul, {li: feedEntries, feedBackgroundColor: this.prop.feedBackgroundColor || DEFAULT.feedBackgroundColor});
            var feedHeight = parseInt(this.prop.height) - parseInt(this.prop.overlayHeight || DEFAULT.overlayHeight);
            var ulWrapper = buildTemplate.call(this, _templates.ulWrapper, {ul: ul, 
                feedHeight: feedHeight + 'px',
                ulWrapperPos: this.prop.overlayPosition && this.prop.overlayPosition.toLowerCase() === 'top' ? 'relative' : 'static',
                overlayHeight: this.prop.overlayPosition && this.prop.overlayPosition.toLowerCase() === 'top' ? parseInt(this.prop.overlayHeight || DEFAULT.overlayHeight) + 'px' : 0,
            });
            var overlayBox = buildTemplate.call(this, _templates.overlayBox, {fbookPageLink: FB_BASE_URL + this.prop.facebookPageUrl, 
                overlayHeight:          appendSuffix(this.prop, 'overlayHeight'),
                overlayColor:           (overlayColorRGB.r + ',' + overlayColorRGB.g + ',' + overlayColorRGB.b),
                overlayPosition:        (this.prop.overlayPosition || DEFAULT.overlayPosition),
                buttonColor:            (this.prop.buttonColor || DEFAULT.buttonColor),
                buttonTextColor:        (this.prop.buttonTextColor || DEFAULT.buttonTextColor),
                buttonTextFontSize:     appendSuffix(this.prop, 'buttonTextFontSize'),
                buttonWidth:            appendSuffix(this.prop, 'buttonWidth'),
                buttonHeight:           appendSuffix(this.prop, 'buttonHeight'),
                buttonPositionTop:      appendSuffix(this.prop, 'buttonPositionTop'),
                buttonPositionRight:    appendSuffix(this.prop, 'buttonPositionRight'),
                buttonText:             (this.prop.buttonText || DEFAULT.buttonText),
                buttonTextFontFamily:   (this.prop.buttonTextFontFamily || DEFAULT.buttonTextFontFamily),
            });

            this.div.innerHTML = buildTemplate.call(this, _templates.holder, {overlayBox: overlayBox, ulWrapper: ulWrapper}); 

            // Apply clickthroughs
            var liTags = this.div.querySelectorAll('li');
            for(var i=0; i<liTags.length; i++) {
                liTags[i].addEventListener('click', function(event) {
                    event.preventDefault();
                    if(event.target.tagName === 'A') {
                        EB.clickthrough('FacebookFeedClicked', event.target.href);
                    } else {
                        EB.clickthrough('FacebookFeedClicked', event.currentTarget.getAttribute('data-fbpost')); //IE 9
                    }
                }.bind(this));
            }

            this.div.querySelector('#fbook-page').addEventListener('click', function(event) {
                event.preventDefault();
                EB.clickthrough('FacebookFeedClicked', event.currentTarget.href);
            }.bind(this));
        }

        // Appends the suffix 'px' if needed
        function appendSuffix(propArray, name) {
            var prop = (propArray[name] || DEFAULT[name]);
            if (typeof(prop) === 'number') {
                prop += 'px';
            } else if (typeof(prop) === 'string') {
                prop = prop.toLowerCase().slice(-2) === 'px' ? prop : prop + 'px';
            }
            return prop;
        }

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            result = result ? result : /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(DEFAULT.overlayColor);
            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            };
        }

        function fetchFeedData(url, callback) {
            require([url+'&callback=define'], function(data){
                if (data && data.data instanceof Array) {
                    callback.call(this, data.data);
                } else if (data && data.error) {
                    console.log('facebook-feed: request failed - ' + data.error.message);
                } else {
                    console.log('facebook-feed: request failed');
                }
            }.bind(this));
        }

        return FacebookFeedComp;
    }
);
