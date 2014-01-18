<!--
 * Copyright (c) 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Michael Mahemoff
 *         Eric Bidelman <ericbidelman@chromiumg.org>
-->
const JOB_CATEGORY = 'jobs';
    var here = {};
    var closestJob = null;
    var geocoder = new GClientGeocoder();
    var map;

    var jobPositionEl = document.getElementById('position');
    var withinEl = document.getElementById('within');

    window.onload = function() {
      if (!GBrowserIsCompatible() || !navigator.geolocation) {
        handleError("Can't do this!");
        return;
      }

      map = new GMap2(document.getElementById('mapContainer'));
      map.setCenter(new GLatLng(37.4419, -122.1419), 13);
      map.setUIToDefault();

      navigator.geolocation.getCurrentPosition(
        function(position) {
          here.pos = new GLatLng(position.coords.latitude,
                                 position.coords.longitude);
          map.setCenter(here.pos);
          map.addOverlay(new GMarker(here.pos));

          geocoder.getLocations(here.pos, findNearbyJobs);
        },
        handleError
      );
    };

    function handleError(message) {
      alert(message || "Can't do this!");
    }

   function resetMap() {
     closestJob = null;
     document.getElementById('closest-job').textContent = 'Loading...';
     document.getElementById('num-results').textContent = '-';
     map.clearOverlays();
     map.setCenter(here.pos);
     map.addOverlay(new GMarker(here.pos));
   }

    function doQuery(el, jobPositionEl, withinEl) {
      if (el.attributes['data-previous'].value == el.textContent) {
        return;
      } else if (el.textContent == '') {
        el.textContent = el.attributes['data-previous'].value
        return;
      }
      el.attributes['data-previous'].value = el.textContent;
      resetMap();
      queryGoogleBase(JOB_CATEGORY, jobPositionEl.textContent, here.address,
                      withinEl.textContent + 'mi');
    }

    jobPositionEl.addEventListener('blur', function(e) {
      doQuery(this, jobPositionEl, withinEl);
    });

    jobPositionEl.addEventListener('keypress', function(e) {
      // Prevent enter key from sticking return in the contenteditable box.
      if (e.keyCode == 13) {
        e.preventDefault();
        e.stopPropagation();
        doQuery(this, jobPositionEl, withinEl);
      }
    });

    withinEl.addEventListener('blur', function(e) {
      doQuery(this, jobPositionEl, withinEl);
    });

    withinEl.addEventListener('keypress', function(e) {
      // Prevent enter key from sticking return in the contenteditable box.
      if (e.keyCode == 13) {
        e.preventDefault();
        e.stopPropagation();
        doQuery(this, jobPositionEl, withinEl);
      }
    });

    document.getElementById('closest-job').addEventListener('click', function(e) {
      map.openInfoWindowHtml(
          closestJob.latlng, generateInfoWindowHTML(closestJob));
    });

    function generateInfoWindowHTML(obj) {
      return ['<h4>', obj.link, ' - ', obj.employer, '</h4>',
              '<ul><li>Published: ', obj.published,
              '<li>Function: ', obj.jobFunc, '</li>',
              '<li>Description: ', obj.description, '</li>',
              '<li>Hours: ', obj.jobType, '</li></ul>'].join('');
    }

    function findNearbyJobs(response) {
      if (!response || response.Status.code != 200) {
        alert('Status Code:' + response.Status.code);
      } else {
        here.address = response.Placemark[0].address;
        queryGoogleBase(JOB_CATEGORY, jobPositionEl.textContent, here.address,
                        withinEl.textContent + 'mi');
      }
    }

    function queryGoogleBase(type, query, address, radius) {
      var q = ['http://www.google.com/base/feeds/snippets/-/', type,
               '?q=', encodeURIComponent(query), '&bq=[location:%40"', address,
               '"%2B', radius, ']&content=geocodes&max-results=50&alt=json'].join('');

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(e) {
        if (this.readyState == 4 && this.status == 200) {
          var resp = JSON.parse(this.responseText);

          if (!resp.feed || !resp.feed.entry || !resp.feed.entry.length) {
            document.getElementById('closest-job').textContent = 'No results for that query.';
            return;
          }

          var newBounds = new GLatLngBounds();

          resp.feed.entry.forEach(function(val, i) {
            var job = {};
            if (!val.g$location[0].g$latitude ||
                !val.g$location[0].g$longitude) {
              return;
            }
            job.latlng = new GLatLng(parseFloat(val.g$location[0].g$latitude.$t),
                                     parseFloat(val.g$location[0].g$longitude.$t));
            job.title = val.title.$t;
            job.description = val.content.$t;
            job.author = val.author ? val.author[0].$t : 'N/A';
            job.employer = val.g$employer ? val.g$employer[0].$t : 'N/A';
            job.jobFunc = val.g$job_function ? val.g$job_function[0].$t : 'N/A';
            job.jobType = val.g$job_type ? val.g$job_type[0].$t : 'N/A';

            job.published = 'N/A';
            if (val.g$publish_date) {
              var parts = val.g$publish_date[0].$t.split('-');
              job.published = [parts[1], parts[2], parts[0].substring(2)].join('/');
            }

            var altLink = null;
            for (var j = 0, link; link = val.link[j]; ++j) {
              if (link.rel == 'alternate') {
                altLink = link.href;
                break;
              }
            }
            job.link = altLink ? '<a href="' + altLink + '" target="_blank">' + 
                                 job.title + '</a>' : job.title;

            // Calculate closest found job.
            if (!closestJob ||
                job.latlng.distanceFrom(here.pos) <
                closestJob.latlng.distanceFrom(here.pos)) {
              closestJob = job;
            }

            var myIcon = new GIcon();
            myIcon.image = 'pushpin.png';
            myIcon.shadow = 'pushpin_shadow.png';
            myIcon.iconSize = new GSize(32, 32);
            myIcon.shadowSize = new GSize(59, 32);
            myIcon.iconAnchor = new GPoint(10, 35);
            myIcon.infoWindowAnchor = new GPoint(30, 5);

            var marker = new GMarker(job.latlng, {icon: myIcon});

            GEvent.addListener(marker, 'click', function(e) {
              map.openInfoWindowHtml(job.latlng, generateInfoWindowHTML(job),
                                     {pixelOffset: new GSize(15, -18)});
            });

            newBounds.extend(job.latlng);
            map.addOverlay(marker);
          });

          map.setCenter(newBounds.getCenter(),
                        map.getBoundsZoomLevel(newBounds));

          document.getElementById('num-results').textContent = resp.feed.entry.length;
          document.getElementById('closest-job').textContent = [
              Math.round(closestJob.latlng.distanceFrom(here.pos) / 1609), ' miles away - ',
              closestJob.title].join('');
        }
      };
      xhr.open('GET', q);
      xhr.send();
    }