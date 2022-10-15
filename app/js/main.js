$(function () {

	$('.header__burger').on('click', function () {
		$('.header__burger').toggleClass('header__burger--active');
		$('.header__menu').toggleClass('header__menu--active');
	});

	$('.slider-basics').slick({
		infinite: true,
		slidesToShow: 2,
		slidesToScroll: 1,
		adaptiveHeight: true,
		responsive: [
			{
				breakpoint: 620,
				settings: {
					slidesToShow: 1,
				}
			}
		]
	});
});