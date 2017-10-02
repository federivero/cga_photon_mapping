var default_config = {
	"resolution" : {
		"x" : 800,
		"y" : 600
	},
	"global_map_photon_count" : 49000,
	"caustic_map_photon_count" : 1000,
	"photon_max_bounce" : 5,
	"nearby_photons_per_point_type"  : "proportional",
	"nearby_photons_fixed_quantity" : 100,
	"nearby_photons_proportion" : 0.002,
	"diffuse_photon_scale_factor" : 2,
	"caustic_photon_scale_factor" : 0.1,
	"scene" : {
		"models" : [
			{"model":"models/teapot.obj", "name" : "tea", "texture" : "", "color" : { "r" : 60, "g" : 60, "b": 180}, "transform" :
			{ "translate" : { "x": -5, "y" : -2.2, "z" : 18},
			  "rotate"	  : { "x": 0, "y" : 240, "z" : 0}	,
			  "scale"	  : { "x": 1, "y" : 1, "z" : 1}
			}
		}],
		"shapes" : [
			{	"type" : "model",
				"name" : "tea",
				"diffuse_color"  : { "r" : 60, "g" : 60, "b": 60},
				"diffuse_reflection_coefficient" : 1,
				"specular_color" : { "r" : 100, "g" : 100, "b": 100},
				"specular_coefficient" : 0,
				"is_mirror" : false,
				"transparency" : 0,
				"refraction_coefficient" : 0
			},
			{ 	"type" : "plane",
				"points" : [
			  		{"x" : -20, "y" : 0, "z" : 0},
					{"x" : -20, "y" : 1, "z" : 0},
					{"x" : -20, "y" : 0, "z" : -1}
				],
			  	"diffuse_color"  : { "r" : 40, "g" : 100, "b": 40},
				"diffuse_reflection_coefficient" : 0.6,
				"specular_color" : { "r" : 100, "g" : 100, "b": 100},
				"specular_coefficient" : 0,
				"is_mirror" : false,
				"transparency" : 0,
				"refraction_coefficient" : 0
			},
			{ 	"type" : "plane",
				"points" : [
			  		{"x" : 20, "y" : 0, "z" : 0},
					{"x" : 20, "y" : 0, "z" : -1},
					{"x" : 20, "y" : 1, "z" : 0}
				],
			  	"diffuse_color"  : { "r" : 190, "g" : 40, "b": 40},
				"diffuse_reflection_coefficient" : 0.6,
				"specular_color" : { "r" : 100, "g" : 100, "b": 100},
				"specular_coefficient" : 0,
				"is_mirror" : false,
				"transparency" : 0,
				"refraction_coefficient" : 0
			},
			{ 	"type" : "plane",
				"points" : [
			  		{"x" : 0, "y" : -3, "z" : 0},
					{"x" : 1, "y" : -3, "z" : 0},
					{"x" : 0, "y" : -3, "z" : 1}
				],
			  	"diffuse_color"  : { "r" : 200, "g" : 200, "b": 200},
				"diffuse_reflection_coefficient" : 0.6,
				"specular_color" : { "r" : 100, "g" : 100, "b": 100},
				"specular_coefficient" : 0,
				"is_mirror" : false,
				"transparency" : 0,
				"refraction_coefficient" : 0
			},
			{ 	"type" : "plane",
				"points" : [
					{"x" : 0, "y" : 12, "z" : 0},
					{"x" : 0, "y" : 12, "z" : 1},
					{"x" : 1, "y" : 12, "z" : 0}
				],
			  	"diffuse_color"  : { "r" : 200, "g" : 200, "b": 200},
				"diffuse_reflection_coefficient" : 0.6,
				"specular_color" : { "r" : 100, "g" : 100, "b": 100},
				"specular_coefficient" : 0,
				"is_mirror" : false,
				"transparency" : 0,
				"refraction_coefficient" : 0
			},
			{ 	"type" : "plane",
				"points" : [
			  		{"x" : 0, "y" : 0, "z" : 30},
					{"x" : 1, "y" : 0, "z" : 30},
					{"x" : 0, "y" : 1, "z" : 30}
				],
			  	"diffuse_color"  : { "r" : 140, "g" : 140, "b": 140},
				"diffuse_reflection_coefficient" : 0.6,
				"specular_color" : { "r" : 100, "g" : 100, "b": 100},
				"specular_coefficient" : 0,
				"is_mirror" : false,
				"transparency" : 0,
				"refraction_coefficient" : 0
			},
			{ 	"type" : "sphere",
				"center" : {"x" : 0, "y" : 0, "z" : 25},
				"radius" : 3,
			  	"diffuse_color"  : { "r" : 150, "g" : 70, "b": 15},
				"diffuse_reflection_coefficient" : 0.5,
				"specular_color" : { "r" : 200, "g" : 200, "b": 200},
				"specular_coefficient" : 0.5,
				"is_mirror" : false,
				"transparency" : 0,
				"refraction_coefficient" : 0
			},
			{ 	"type" : "sphere",
				"center" : {"x" : 5, "y" : -1, "z" : 13},
				"radius" : 2,
			  	"diffuse_color"  : { "r" : 100, "g" : 40, "b": 0},
				"diffuse_reflection_coefficient" : 0,
				"specular_color" : { "r" : 200, "g" : 200, "b": 200},
				"specular_coefficient" : 0,
				"is_mirror" : false,
				"transparency" : 1,
				"refraction_coefficient" : 1.5
			}
		],
		"lights" : [
			{ "type" : "point", "position" : {"x" : 15, "y" : 10, "z" : 15}, "color" : { "r" : 255, "g" : 255, "b": 255}, "power" : 100}
		],
		"camera" : {"x" : 0, "y" : 0, "z" : 5},
		"viewport": {
			"center" : {"x" : 0, "y" : 0, "z" : 10},
			"width" : 12,
			"height" : 8
		}
	}
};
