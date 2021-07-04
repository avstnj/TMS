var citiesCoordinatesArray = [
    { cityCode: 134, coordinates: { enlem: 41.145772, boylam: 28.461587 } },
    { cityCode: 27, coordinates: { enlem: 37.0587715, boylam: 37.380137 } },
    { cityCode:3, coordinates: { enlem:38.75654, boylam:30.5550344 } },
    { cityCode:4, coordinates: { enlem:39.4650965, boylam:43.3877029 } },
    { cityCode:12, coordinates: { enlem:39.002406, boylam:40.6014165 } },
    { cityCode:19, coordinates: { enlem:40.535223, boylam:34.9419039 } },
    { cityCode:20, coordinates: { enlem:37.7819179, boylam:29.0807384 } },
    { cityCode:21, coordinates: { enlem:37.9227925, boylam:40.162678 } },
    { cityCode:24, coordinates: { enlem:39.7057455, boylam:39.4245866 } },
    { cityCode:25, coordinates: { enlem:39.9119, boylam:41.2635166 } },
    { cityCode:26, coordinates: { enlem:39.765343, boylam:30.5448145 } },
    { cityCode: 29, coordinates: { enlem: 40.3376755, boylam: 39.4496535 } },
    { cityCode: 31, coordinates: { enlem: 36.401849, boylam: 36.34981 } },
    { cityCode:33, coordinates: { enlem:36.754845, boylam:34.5286404 } },
    { cityCode: 44, coordinates: { enlem: 38.5198065, boylam: 38.1935824 } },
    { cityCode: 45, coordinates: { enlem: 38.6237513, boylam: 27.3585513 } },
    { cityCode:54, coordinates: { enlem: 40.754623, boylam: 30.470848 } },
    { cityCode:55, coordinates: { enlem:41.2914735, boylam:36.3124015 } },
    { cityCode:62, coordinates: { enlem:39.1862151, boylam:39.568452 } },
    { cityCode:63, coordinates: { enlem:37.3461955, boylam:39.0337321 } },
    { cityCode:65, coordinates: { enlem:38.496424, boylam:43.373220 } },
    { cityCode:67, coordinates: { enlem:41.459024, boylam:31.8001604 } },
    { cityCode:71, coordinates: { enlem:39.841918, boylam:33.5230074 } },
    { cityCode:72, coordinates: { enlem:37.8955195, boylam:41.131737 } },
    { cityCode:74, coordinates: { enlem:41.57842, boylam:32.5145374 } },
    { cityCode: 77, coordinates: { enlem: 40.6426945, boylam: 29.2625665 } },
    { cityCode: 78, coordinates: { enlem: 41.2005195, boylam: 32.563952 } },
    { cityCode: 99, coordinates: { enlem: 40.996613, boylam: 28.723799 } },
    { cityCode:101, coordinates: { enlem:39.3335939, boylam:26.7079289 } },
    { cityCode:102, coordinates: { enlem:41.433333, boylam:31.75 } },
    { cityCode:104, coordinates: { enlem:40.299667, boylam:35.8905265 } },
    { cityCode:105, coordinates: { enlem:40.208037, boylam:26.5518195 } },
    { cityCode:106, coordinates: { enlem:41.1507205, boylam:27.8112166 } },
    { cityCode:107, coordinates: { enlem:40.238894, boylam:36.1933631 } },
    { cityCode:109, coordinates: { enlem:36.1950788, boylam:38.8171335 } },
    { cityCode:110, coordinates: { enlem:40.393673, boylam:36.076144 } },
    { cityCode:111, coordinates: { enlem:41.210652, boylam:32.3080386 } },
    { cityCode:113, coordinates: { enlem:37.146544, boylam:29.51352 } },
    { cityCode:114, coordinates: { enlem:42.6606262, boylam:20.2982189 } },
    { cityCode:115, coordinates: { enlem:42.2234191, boylam:20.7345977 } },
    { cityCode:116, coordinates: { enlem:38.2804525, boylam:31.90709 } },
    { cityCode:117, coordinates: { enlem:40.5810483, boylam:35.5950843 } },
    { cityCode:118, coordinates: { enlem:38.4197935, boylam:27.128812 } },
    { cityCode:119, coordinates: { enlem:40.1326984, boylam:49.8312369 } },
    { cityCode:121, coordinates: { enlem:37.2050435, boylam:40.6015735 } },
    { cityCode:122, coordinates: { enlem:39.5052985, boylam:26.9107961 } },
    { cityCode:124, coordinates: { enlem:39.5550395, boylam:44.0714331 } },
    { cityCode:129, coordinates: { enlem:40.3376755, boylam:39.4496536 } },
    { cityCode:159, coordinates: { enlem:41.0772125, boylam:27.416779 } },{ cityCode:190, coordinates: { enlem:40.535223, boylam:34.9419039 } },
    { cityCode: 200, coordinates: { enlem: 31.7945249, boylam: -7.0849336 } },
    { cityCode: 9, coordinates: { enlem: 37.8360962, boylam: 27.8137687 } },
    { cityCode: 61, coordinates: { enlem: 41.0030921, boylam: 39.7282645 } },
    { cityCode: 180, coordinates: { enlem: -1.9578351, boylam: 30.0802849 } },
    { cityCode: 65, coordinates: { enlem: 38.489516, boylam:  43.371982 } }
];



function getCityCoordinates(cityCode) {
    for (var i = 0; i < citiesCoordinatesArray.length; i++) {
        if (citiesCoordinatesArray[i].cityCode == cityCode) {
            return citiesCoordinatesArray[i].coordinates;
        }
    }
    return undefined;
}