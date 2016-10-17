var _scroll = true;

$(function() {
    var timer  = null;
   function setSlider(){
       var scrollTop = $(window).scrollTop(),
           windowHeight = $(window).height(),
           secondBlock = $('.screen.s2').offset().top,
           s8 = $('.screen.s8').offset().top,
           s13 = $('.screen.s13').offset().top,
           s11 = $('.screen.s11').offset().top
           ;
/*
       if( scrollTop >= secondBlock ){
           $("#nav").show();
       }else{
           $("#nav").hide();
       }
*/
       if( scrollTop >= windowHeight && scrollTop <= s11){
           $("#nav").removeClass("hidebg");
       }else{
           $("#nav").addClass("hidebg");
       }

       if( scrollTop >= (secondBlock-windowHeight+150) ) {
           runCounters($(".cnts1"));
       }
       if( scrollTop >= (s8-windowHeight+150) ){
           $(".fadeIn_").removeClass("fadeIn_").addClass("fadeIn");
           $(".fadeInLeft_").removeClass("fadeInLeft_").addClass("fadeInLeft");
           $(".fadeInRight_").removeClass("fadeInRight_").addClass("fadeInRight");
       }

       if( scrollTop >= (s13-windowHeight) ) {
           runCounters($(".num1"));
       }
       $(".screen").each(function(){
           var actualBlock = $(this),
               offset = scrollTop - actualBlock.offset().top;

       });
   }
    setSlider();
    $(window).on('scroll touchmove resize', function (e) {
        //if (!_scroll) return;
        //(!window.requestAnimationFrame) ? setSlider() : window.requestAnimationFrame(setSlider);
        setSlider();
    });


    $(".email").Popup({container:"email"});
    $("#enter").Popup({container:"entry"});
    $(".route").Popup({container:"route"});
    $(".thanks").Popup({container:"thanks"});
    $(".tariff-s").Popup({container:"tariff-s"});
    $(".tariff-m").Popup({container:"tariff-m"});
    $(".tariff-l").Popup({container:"tariff-l"});

    $(".sendMail").on("click", function(){
        var t=false, p = $("input,textarea", $(this).parents(".sender")).map(function(){
            t = !!$(this).val();
            console.log($(this).prop("name"), $(this).val());
            return { name: $(this).prop("name"), value: $(this).val() };
        }).get();
        if(!t) return;
        t = false;
        $.post("http://land.mover24.ru/mail/send.php", p, function(data){ }, "json");
        $(".thanks").trigger("click");
        setTimeout(function(){ $(".thanks").Popup("close"); },2000);
    });

    $("[name=phone]").mask("+7 ( 999 ) 9999999");


    $(".change").each(function(){
        var interval = null,
            self = $(this),
            parent = self.parents(".screen");
        $("li", self).click(function(){
            clearInterval(interval);
            $("li",self).removeClass("active");
            $(this).addClass("active");
            $(".eq",parent).removeClass("fadeInd");
            $(".eq",parent).eq( $("li.active", self).index() ).addClass("fadeInd");
        });

    /*    interval = setInterval(function(){
            var el = $("li.active",self),
                cnt = $("li",self).length - 1,
                idx = el.index() == cnt ? 0 : (el.index() % cnt)+1 ;
            el.removeClass("active");
            $("li",self).eq( idx ).addClass("active");
            $(".eq.fadeInd",parent).removeClass("fadeInd");
            $(".eq",parent).eq( idx ).addClass("fadeInd");
        },4000);
*/
    });

    function runCounters(obj) {
        obj.each(function () {
            var el = $(this), inter = null;
            if(el.data("stop")) return;
            el.data("stop",true);
            inter = setInterval(function () {
                if (el.data("from") <= el.data("to")) {
                    el.data("from", el.data("from") + el.data("step"));
                    el.text(el.data("from"));
                }
            }, el.data("interval"));
        });
    }


    $('.jcarousel')
        .jcarousel({
            wrap: "both"
        })
        .jcarouselAutoscroll({
            interval: 3000,
            target: '+=1',
            autostart: true
        })
    ;

    $('.jcarousel-prev').click(function() {
        $('.jcarousel').jcarousel('scroll', '-=1');
    });

    $('.jcarousel-next').click(function() {
        $('.jcarousel').jcarousel('scroll', '+=1');
    });

    $(".c3-ul li *").click(function(){
        var t = $(this).data("type") || $(this).parents("li").data("type");
        $("#carfade").fadeOut(function(){
            $(this).prop("src", "/images/"+t+".png").fadeIn();
        });
    });

});




(function($) {
    var Popup = function(element, options) {

        this.element = $(element);
        this.isOpen = false;
        this.popup = $("#popup");
        this.blackout = $("#blackout");
        this.content = $("#popup-content");
        this.closebutton = $(".popup-close");
        this.title = $("#popup-title");
        this.containers = $("#containers");

        this.options = $.extend({
            container : null
        }, options);

        this.bind();
    };

    Popup.prototype = {

        getOptions : function(){
            return this.options;
        },

        setContent: function(  ){
            this.containers.append( this.content.children() );
            this.content.append( this.container );
            this.title.html( this.container.data("title") );
            return this;
        },
        open: function(){
            if(this.options.container && $("#"+this.options.container, this.containers).length > 0){
                this.container = $("#"+this.options.container, this.containers);
                this.setContent();
            }
            this._reposition();
            this.blackout.show();
            this.popup.show();
            this.isOpen = true;
            $("body").css({"overflow-y":"hidden"});
            _scroll = false;
        },
        close : function(){
            this.popup.hide();
            this.blackout.hide();
            this.containers.append( this.container );
            this.isOpen = false;
            $("body").css({"overflow-y":"auto"});
            _scroll = true;
        },
        _reposition : function( ) {
            this.popup.css("top", Math.max(0, (($(window).height() - $(this.popup).outerHeight()) / 2) + $(window).scrollTop()) - 100 + "px")
                .css("left", Math.max(0, (($(window).width() - $(this.popup).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
            this.blackout.height( $(document).height() );
        },
        bind: function(){
            var self = this;
            $.each([this.blackout, this.closebutton], function(){ $(this).click( function(){ self.close(); } ) });
            this.element.click( function(){ self.open(); return false;} );
            $(document).on("keydown",function(event){
                if( event.which=='27') {
                    self.close();
                }
            });
            return this;

        }
    };

    $.fn["Popup"] = function(options) {
        var isMethodCall = typeof options === "string",
            args = Array.prototype.slice.call(arguments, 1),
            returnValue = this;

        if ( isMethodCall && options.substring(0, 1) === '_' ) {
            return returnValue;
        }

        this.each(function() {
            var instance = $.data(this, "Popup");
            if (!instance) {
                instance = $.data(this, "Popup", new Popup(this,options));
            }
            if (isMethodCall) {
                returnValue = instance[options].apply(instance, args);
            }
        });

        return returnValue;
    };
}( jQuery ));

function go(target){
    $('body,html').animate({'scrollTop': $(target).offset().top - $("#nav").height() }, 500, function(){
    });
    return false;
}