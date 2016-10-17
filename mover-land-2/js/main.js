var _scroll = true;
$().ready(function(){
	var animating = false;

	//update arrows visibility and detect which section is visible in the viewport
	setSlider();
	$(window).on('scroll resize', function(e){
        if(!_scroll) return;
		(!window.requestAnimationFrame) ? setSlider() : window.requestAnimationFrame(setSlider);
//        $(document).trigger("mousewheel");
//        setSlider();
	});

	//move to next/previous section clicking on arrows
    $('.cd-vertical-nav .cd-prev').on('click', function(){
    	prevSection();
        return false;
    });
    $('.cd-vertical-nav .cd-next').on('click', function(){
    	nextSection();
        return false;
    });

    $('.cd-vertical-nav .cd-section').on('click', function(){
    	gotoSection( $(this).index() );
        return false;
    });

    //move to next/previous using the keyboards
    $(document).on("keydown mousewheel",function(event){
        if(!_scroll) return;
		if( event.which=='38' || event.which=='33' || event.deltaY == 1) {
			prevSection();
			event.preventDefault();
		} else if( event.which=='40' || event.which=='34' || event.deltaY == -1 ) {
			nextSection();
			event.preventDefault();
		} else if( event.which=='36'){
            gotoSection(0);
            event.preventDefault();
        } else if( event.which=='35'){
            gotoSection($('section').length-1);
            event.preventDefault();
        }

	});

    function gotoSection(num){
        if (!animating) {
            smoothScroll( $('section').eq(num) );
        }
    }

	//go to next section
	function nextSection() {
		if (!animating) {
			if ($('.is-visible[data-type="slider-item"]').next("section").length > 0) smoothScroll($('.is-visible[data-type="slider-item"]').next("section"));
		}
	}

	//go to previous section
	function prevSection() {
		if (!animating) {
            if ($('.is-visible[data-type="slider-item"]').prev("section").length > 0) smoothScroll($('.is-visible[data-type="slider-item"]').prev("section"));
//			var prevSection = $('.is-visible[data-type="slider-item"]');
//			if(prevSection.length > 0 && $(window).scrollTop() != prevSection.offset().top) {
//				smoothScroll(prevSection);
//			} else if(prevSection.prev().length > 0 && $(window).scrollTop() == prevSection.offset().top) {
//				smoothScroll(prevSection.prev('[data-type="slider-item"]'));
//			}
		}
	}

	function setSlider() {
//		checkNavigation();
		checkVisibleSection();

	}

	//update the visibility of the navigation arrows
	function checkNavigation() {
		( $(window).scrollTop() < $(window).height()/2 ) ? $('.cd-vertical-nav .cd-prev').addClass('inactive') : $('.cd-vertical-nav .cd-prev').removeClass('inactive');
		( $(window).scrollTop() > $(document).height() - 3*$(window).height()/2 ) ? $('.cd-vertical-nav .cd-next').addClass('inactive') : $('.cd-vertical-nav .cd-next').removeClass('inactive');
	}

	//detect which section is visible in the viewport
	function checkVisibleSection() {
		var scrollTop = $(window).scrollTop(),
			windowHeight = $(window).height();

		$('[data-type="slider-item"]').each(function(){
			var actualBlock = $(this),
				offset = scrollTop - actualBlock.offset().top ;

			//add/remove .is-visible class if the section is in the viewport - it is used to navigate through the sections
			( offset >= 0 && offset < windowHeight ) ? actualBlock.addClass('is-visible') : actualBlock.removeClass('is-visible');
		});

        $("#nav").removeClass().addClass("bg"+ $(".is-visible:last").index());
        $("#enter").removeClass().addClass("bge"+ $(".is-visible:last").index());

        $(".cd-section").removeClass("active");
        $(".cd-section").eq( $(".is-visible:last").index() -1 ).addClass("active");
	}

	function smoothScroll(target) {
        if(!_scroll) return;
        if(!target) return;

//        $(".cd-section").removeClass("active");
//        $(".cd-section").eq(target.index()-1).addClass("active");

		animating = true;
        $('body,html').animate({'scrollTop': target.offset().top}, 500, function(){
            $("section.is-visible").removeClass("is-visible");
            target.addClass('is-visible');

            $("#nav").removeClass().addClass("bg"+target.index());
            $("#enter").removeClass().addClass("bge"+target.index());
            animating = false; });
	}
//    $(".cd-section").eq($("section.is-visible").index()-1).addClass("active");

    var interval = null;
    $(".change li").click(function(){
        clearInterval(interval);
        $(".change li").removeClass("active");
        $(this).addClass("active");

        $(".eq").removeClass("active");
        $(".eq").eq( $(".change li.active").index() ).addClass("active");

    });

    interval = setInterval(function(){
        var el = $(".change li.active"),
            cnt = $(".change li").length - 1,
            idx = el.index() == cnt ? 0 : (el.index() % cnt)+1 ;
        el.removeClass("active");
        $(".change li").eq( idx ).addClass("active");

        $(".eq.active").removeClass("active");
        $(".eq").eq( idx ).addClass("active");

    },4000);

    $(".email").Popup({container:"email"});
    $(".thanks").Popup({container:"thanks"});

    $(".sendMail").on("click", function(){
        var p = $("input,textarea", $(this).parents(".sender")).map(function(){
            return { name: $(this).prop("name"), value: $(this).val() };
        }).get();
        $.post("/mail/send.php", p, function(data){ }, "json");

        $(".thanks").trigger("click");
        setTimeout(function(){ $(".thanks").Popup("close"); },3000);
    });

});

function go(target){
    $('body,html').animate({'scrollTop': $("#"+target).offset().top}, 500);
    return false;
}

(function($) {
var Popup = function(element, options) {

    this.element = $(element);
    this.isOpen = false;
    this.popup = $("#popup");
    this.blackout = $("#blackout");
    this.content = $("#popup-content");
    this.closebutton = $("#popup-close");
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
        $(this.blackout).click( function(){ self.close(); } );
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