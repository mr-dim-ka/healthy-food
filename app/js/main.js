$(function () {

	$('.header__burger').on('click', function () {
		$('.header__burger').toggleClass('header__burger--active');
		$('.header__menu').toggleClass('header__menu--active');
	});
});