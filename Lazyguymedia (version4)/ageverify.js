/*Age Verify Script
Created 3-01-2013 by pMinus */

function writeCookie(key,value,days) {
		if (days) {
		        var date = new Date();
		        date.setTime(date.getTime()+(days*24*60*60*1000));
		        var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = key+"="+value+expires+"; path=/";
	}

function readCookie(key) {
		var nameEQ = key + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') c = c.substring(1,c.length);
		        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}


function ageGate() {
		var monthDays = {
			1: 31,
			2: 29,
			3: 31,
			4: 30,
			5: 31,
			6: 30,
			7: 31,
			8: 31,
			9: 30,
			10: 31,
			11: 30,
			12: 31
		};

		var months = {
			1: 'January',
			2: 'February',
			3: 'March',
			4: 'April',
			5: 'May',
			6: 'June',
			7: 'July',
			8: 'August',
			9: 'September',
			10: 'October',
			11: 'November',
			12: 'December'
		};

		var monthOptions = [];
		var dayOptions = {};
		var yearOptions = [];

		for (var month in monthDays) {
			var days = monthDays[month];
			monthOptions.push('<option value="' + month + '">' + months[month] + '</option>');
			dayOptions[month] = [];
			for (var i=1; i <= days; i++) {
				var day = i;
				dayOptions[month].push('<option value="' + day + '">' + day + '</option>');
			}
		}

		var currentYear = new Date();
		currentYear = currentYear.getFullYear();

		var startYear = currentYear - 120;

		for (var y=currentYear; y > startYear; y--) {
			yearOptions.push('<option value="' + y + '">' + y + '</option>');
		}



		jQuery(document).ready(function($s){
			var monthHtml = '';
			for (var j=0; j < monthOptions.length; j++) {
				var html = monthOptions[j];
				monthHtml += html;
			}

			$s('#ageMonth').html(monthHtml);

			var yearHtml = '';
			for (var i=0; i < yearOptions.length; i++) {
				yearHtml += yearOptions[i];
			}

			$s('#ageYear').html(yearHtml);

			$s('#ageMonth').bind('change', function(){
				var dayHtml = '';
				var month = $s(this).val();

				for (var i=0; i < dayOptions[month].length; i++) {
					dayHtml += dayOptions[month][i];
				}

				$s('#ageDay').html(dayHtml);
			});

			$s('#ageEnterSite').click(function(e){
				e.preventDefault();
				var date = new Date();
				date.setMonth($s('#ageMonth').val() - 1);
				date.setDate($s('#ageDay').val());
				date.setYear($s('#ageYear').val());

				var maxDate = new Date();
				// alert(maxDate.getFullYear());

				maxDate.setYear(maxDate.getFullYear() - 18);

				if (date <= maxDate) {
					writeCookie('pminus_age_verified', '1', 30);
					$s('#age-gate').fadeOut(function(){
						$s(this).remove();
						$s('body').removeClass('age-gate-visible');
					});
				}
				else {
					window.location.href = 'http://en.wikipedia.org/wiki/Parental_Advisory';
				}

			});

			$s('#ageMonth').change(); // load default month
			// $s('#ageDay').prop('disabled', true);
			setTimeout(function(){
				$s('body').addClass('age-gate-visible');
				$s('#age-gate').fadeIn();
			}, 200);
		});
	}

	if (readCookie('pminus_age_verified')) {

	} else {
		ageGate();
	}