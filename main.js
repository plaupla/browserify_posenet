//import { poseSimilarity } from "posenet-similarity";

/*
const pose1 = [
  338.41225590687316, 355.21071467418153, 315.87973242140004,
  378.38232968104023, 274.19273613955727, 421.7554518406493, 213.3405989709995,
  517.097552110249, 117.12701018218401, 552.972455154597, 150.6275043413333,
  455.7871397738327, 221.53676311329644, 482.4750818631065, 147.9674544872477,
  482.3688064753313, 157.39926156366846,
];
const pose2 = [
  96.2918447056633, 77.62438955937841, 76.0972752552552, 91.38114840140139,
  87.45391608212245, 169.5519983907618, 173.97316543044747, 299.8198299185311,
  306.97488747682087, 392.13241102166677, 391.0415275365926, 455.3677783773103,
  456.988785443139, 558.827905024072, 535.6223068534168, 558.9190228532724,
  540.9849019922635,
];

const similarity = require("compute-cosine-similarity");

//calculate with the default strategy for one pose testing
const result = similarity(pose1, pose2);
console.log(result);

*/

const targetPose = [
  {
    pose: "start",
    xpos: [
      348.45116403780094, 361.48405557476593, 329.9245111487719,
      383.1316734937378, 295.13510737437684, 422.8821845741124,
      237.19489650503672, 485.5722989924687, 167.529704765587,
      503.12394910285445, 180.98349842116062, 356.8499703908245,
      240.20239893100606, 302.81016071482856, 140.56238077957806,
      273.85961272837125, 162.68013445783683,
    ],

    ypos: [
      85.56370538496321, 71.22695982224283, 69.22882911296207, 5.01222424933883,
      83.33888131820737, 166.1477910498237, 173.38871106099526,
      308.8786007179824, 308.1592936831226, 396.97426384061225,
      396.21247020676907, 467.60412431412635, 466.45403672748967,
      529.1653074271948, 529.1653074271948, 552.0796203613281, 541.320951587959,
    ],
  },
  {
    pose: "pose1",
    xpos: [
      352.3333211817166, 369.31400165483643, 328.7652362274289,
      391.70569453257997, 291.16485714448567, 442.6869638049649,
      216.47451675355666, 523.0347047798365, 126.17579597443458,
      522.1977275447623, 107.853321119969, 457.6881177137798,
      228.01492297695768, 526.9878657597048, 136.51671175826849,
      522.5579486653962, 157.46492244854048,
    ],
    ypos: [
      95.41428146659169, 78.44185372734813, 76.85399690026904,
      91.89960049284107, 90.93744893946072, 174.2667611563716,
      182.14048155550825, 308.8786007179824, 306.89585407420356,
      402.04418256588946, 379.3897196847641, 468.0305344399775,
      451.72088623046875, 574.2788993152664, 535.8838080617704,
      571.9698206088887, 542.0639524942243,
    ],
  },
  {
    pose: "pose2",
    xpos: [
      479.0681304634777, 508.8231780649623, 484.34756208486596,
      509.9788348127432, 474.63727364744193, 442.6869638049649,
      429.3411747676389, 523.0347047798365, 414.130466327593, 522.1977275447623,
      522.1977275447623, 457.6881177137798, 420.64827648118313,
      526.9878657597048, 477.9423569519696, 522.5579486653962, 482.556007474313,
    ],
    ypos: [
      216.12121463285808, 212.21865880350197, 211.66821550302467,
      241.00446871746374, 237.3273983075925, 225.9669156204402,
      271.0718129673821, 306.81460369421814, 407.64854579584147,
      402.04418256588946, 402.04418256588946, 468.0305344399775,
      471.21414600179355, 574.2788993152664, 569.7080393987872,
      571.9698206088887, 568.6708442895792,
    ],
  },
  {
    pose: "pose3",
    xpos: [
      336.352955858995, 355.4066214951096, 311.7163169059308, 378.5555424671693,
      268.1603327057241, 437.9639076351656, 219.9134796973796,
      525.1298962307347, 82.25481441512646, 523.7099311323946,
      167.02761638953064, 404.7144409654669, 196.1810368044367,
      449.0233246918318, 78.51449610194344, 480.695506589422,
      117.65611982531121,
    ],
    ypos: [
      97.04585568914155, 78.02745640973637, 76.6646991536775, 96.07150304178319,
      92.41819745371777, 175.7582513831469, 194.2611436064605,
      306.49478897510335, 275.6953807192554, 398.1991871785561,
      166.33133647042953, 469.9905834865941, 463.8099925712853,
      575.5666924265108, 499.5733250718173, 570.6507784476076,
      539.9677867369893,
    ],
  },
  {
    pose: "pose4",
    xpos: [
      353.37602904798456, 369.4632385491397, 330.40533043531127,
      392.9562692605104, 290.90744077927405, 446.2685195388497,
      223.3405764093659, 531.2253816953429, 117.60189442319165,
      540.466997317303, 228.91199727930447, 438.67530603817, 232.75720677950966,
      395.0450561760928, 124.23755927772373, 395.5916470776272,
      154.98512772734526,
    ],
    ypos: [
      93.98244182423394, 77.71442873468658, 76.39488220214844,
      90.12943252979085, 90.9773105962731, 178.41165149258268,
      182.36352230324354, 309.31761804721697, 293.86158509013256,
      401.29723159255684, 341.63836764918227, 475.321829532371,
      429.6204527621139, 563.8277188905946, 498.80104628982247,
      556.9768605807412, 543.4653410559034,
    ],
  },
  {
    pose: "pose5",
    xpos: [
      316.4913992380818, 334.4834205241519, 297.9349134868221,
      364.57493704116763, 259.7099238889227, 416.10851837039456,
      194.25663187346106, 494.56186376193153, 100.77752851790491,
      528.6597700898286, 201.1373723249027, 412.3259548083354,
      213.58206782359557, 511.0660086902663, 110.68428722337062,
      515.516743047692, 152.0587728181238,
    ],
    ypos: [
      94.53196840991305, 75.87886973577716, 76.15458922627371,
      90.23525727862051, 86.5018673907922, 171.90623836294688,
      179.9230149562257, 316.18551677303094, 296.7145428490546,
      390.6207061648833, 342.7691056663424, 434.0167361010838,
      408.74297264485045, 459.10860766696555, 506.83600518490096,
      552.631277240204, 545.609343413713,
    ],
  },
  {
    pose: "pose6",
    xpos: [
      43.08674140663, 361.12389382685205, 320.7437205036327, 381.7155616849313,
      282.4466847816794, 407.4782363357247, 217.89175308168166,
      524.5052494984193, 125.19324098579615, 503.3304901716774,
      243.2793518541388, 427.17898595193947, 226.34599025147435,
      448.5211003522465, 120.26861406022009, 487.389474712921,
      151.60628085006536,
    ],
    ypos: [
      97.97501382196924, 80.47237938016306, 79.78923604646081,
      97.85941394850437, 90.96296970946315, 177.12679258116486,
      178.51396018892876, 301.41727907648345, 297.03296943397373,
      214.19362821467655, 347.02096189506324, 449.15593128723856,
      450.08519035369045, 575.2641991047544, 530.6635162709752,
      559.9100390482506, 547.0298749278028,
    ],
  },
  {
    pose: "pose7",
    xpos: [
      334.94971249354023, 353.68396862935464, 312.39479332118646,
      375.76596746184947, 271.04504655771217, 421.3362863741032,
      208.82922220786722, 500.49561734329404, 123.6370151979914,
      372.8866897761126, 215.7216255395793, 395.3782104610933,
      219.1943430622264, 363.4035385072463, 124.28414786372204,
      351.75392596174305, 156.803257864273,
    ],
    ypos: [
      99.21747704888134, 80.64097630838475, 79.27113327070896, 95.6744337267449,
      89.11386452760215, 170.12238617537088, 170.5829474898164,
      319.85377656810476, 293.396684817303, 353.7120988304049,
      346.50967727839253, 448.99363358197047, 434.58902262528125,
      521.842846406573, 509.27490471865883, 549.5710695021811,
      548.0888806057347,
    ],
  },
  {
    pose: "pose8",
    xpos: [
      361.5601396375129, 383.3599319161144, 337.8993076665856,
      408.15582809745104, 297.48743435752067, 463.1888209242765,
      253.67686587085058, 573.2691047163789, 136.37913091637282,
      413.02285635981576, 263.6221254103842, 435.4061435447129,
      205.1834498305265, 409.4886025751611, 124.96361877203915,
      389.921443360325, 154.3029066746337,
    ],
    ypos: [
      99.49594816809034, 77.8051607896382, 80.30079919540464, 88.90601429030124,
      88.83380756303958, 168.53598984299003, 172.5081293128344,
      325.1392836515078, 284.82424546772404, 366.4230631668744,
      232.60254974958963, 457.20059643459695, 434.48987463568903,
      539.4949839551161, 553.0203131293508, 548.3686947358722,
      540.1465271233585,
    ],
  },
  {
    pose: "pose9",
    xpos: [
      340.2979133101289, 357.3787459881853, 320.0278824683757, 381.509182109907,
      285.76426227732856, 427.9985859792984, 241.71782200438503,
      508.629138516081, 130.1155583125608, 390.00111026986565,
      170.88957077798213, 383.6515030322836, 216.6254350832928,
      462.7880241898711, 125.8377372058913, 497.70247641240576,
      160.60577986305327,
    ],
    ypos: [
      89.54887301077639, 70.7358019639546, 71.53358607904457, 83.55068666925689,
      81.93717956542969, 167.6801101150216, 186.23677294541892,
      322.48729987830967, 301.8285052228994, 366.3546230449751,
      187.20178863881625, 467.8020124027238, 458.2207491982308,
      570.1930480244558, 554.5680281345947, 553.2595896442576,
      545.0840325856487,
    ],
  },
  {
    pose: "pose10",
    xpos: [
      317.4932191900706, 340.4847141369771, 298.21964724054595,
      363.0631336256688, 258.33622913880106, 416.77500446482856,
      194.36992660106853, 498.57968697752005, 124.89805466470088,
      364.90359532693947, 109.02407991283135, 404.924032604648,
      201.30387302502584, 408.5872486871504, 108.07979004856213,
      384.08112522229146, 120.12043340660719,
    ],

    ypos: [
      96.16381218461211, 75.07817487308486, 76.81387608153346,
      86.98090846436497, 85.58681206016689, 167.1448418880715,
      184.56153839942544, 325.9596483995015, 310.5148808223264,
      369.5803631140564, 385.671676457624, 458.7542795856639, 455.4772521735165,
      560.8488799811337, 540.361038386126, 545.378539089099, 546.5448081168684,
    ],
  },
  {
    pose: "pose11",
    xpos: [
      352.43051432449994, 370.7460681009849, 333.0651843594206,
      397.0344681498606, 291.062797813564, 428.09337333946377,
      222.22468513459083, 555.7201153944438, 122.03825538724313,
      422.8219841983068, 154.30565028802894, 471.1054844243981,
      215.1122951878648, 540.585405520428, 184.50909328831773,
      552.1842404376672, 199.0082985696162,
    ],
    ypos: [
      92.51802793272739, 72.10166485856942, 74.36903363535839,
      82.55307030585027, 81.91082520243722, 157.7832859499445, 174.421531588187,
      289.52246283742704, 305.76643650633815, 234.5700951958445,
      387.2419756581347, 442.5170266118031, 437.38365110256325,
      576.4353794439294, 538.8764662686953, 570.3803760810584,
      539.6478200237111,
    ],
  },
  {
    pose: "pose12",
    xpos: [
      340.15873059224526, 358.90438393396164, 319.2999171097455,
      381.1608815471486, 280.1357837780904, 419.7334342986229,
      215.5628094506171, 553.4584965687318, 127.95199086230089,
      521.0937241728668, 153.32925225046358, 431.7680578565783,
      230.20564454074963, 496.3567853994407, 143.94668875965164,
      516.1590772101852, 154.70903418871217,
    ],
    ypos: [
      91.52915271803562, 73.50894319408135, 73.65101320734283,
      87.63154560489878, 83.96475023796586, 161.10580874788158,
      172.64265245964555, 292.77696067721, 307.70190168447533,
      204.12605909058095, 391.99377275162635, 469.84964452365034,
      445.8504186251748, 570.8018083980576, 533.967829010366, 571.2452240583962,
      538.8043212890625,
    ],
  },
  {
    pose: "pose13",
    xpos: [
      338.41225590687316, 355.21071467418153, 315.87973242140004,
      378.38232968104023, 274.19273613955727, 421.7554518406493,
      213.3405989709995, 517.097552110249, 117.12701018218401, 552.972455154597,
      150.6275043413333, 455.7871397738327, 221.53676311329644,
      482.4750818631065, 147.9674544872477, 482.3688064753313,
      157.39926156366846,
    ],
    ypos: [
      96.2918447056633, 77.62438955937841, 76.0972752552552, 91.38114840140139,
      87.45391608212245, 169.5519983907618, 173.97316543044747,
      299.8198299185311, 306.97488747682087, 392.13241102166677,
      391.0415275365926, 455.3677783773103, 456.988785443139, 558.827905024072,
      535.6223068534168, 558.9190228532724, 540.9849019922635,
    ],
  },
];

//Similarity Calculation
//get the target data. all 14 poses
let xPosition = targetPose.map((k) => k.xpos);
// console.log(xPosition); //17 arrays.how to breakdown into one array each
let yPosition = targetPose.map((k) => k.ypos);
// console.log(yPosition);

//setup for function to iterate outer loop
//

//console.log("start targetpose", targetPose);

//  targetPose.forEach(function(getVectorTarget) {
//    //define a function but never excute
//    console.log('foreach target',getVectorTarget);
//    //get only one pose

// //for of
// for (let pose of targetPose) {
//   console.log(pose);
// }

//set up initializor
//only works for pose1
let vectorTarget = [];
let i = 0;
for (a in xPosition) {
  let xposT = xPosition[i];
  let yposT = yPosition[i];
  //console.log("xpos", xposT);
  //console.log("ypos", yposT);
  let minX = Math.min(...xposT);
  let minY = Math.min(...yposT);
  //console.log("min x", minX);
  //console.log("min y", minY);

  for (var j = 0; j < xposT.length; j++) {
    vectorTarget.push(xposT[j] - minX);
    vectorTarget.push(yposT[j] - minY);
  }
  //console.log("vector", vectorTarget);
  i++;
}

//+++ set target data into similarity calculation
//slice 14poses

const sliced = [];
for (var z = 0; z < vectorTarget.length; z += 34) {
  sliced.push(vectorTarget.slice(z, z + 34));
}
console.log(sliced);

//array is sliced //set up delay 3 seconds

// const interval = 3000;
// let slicedvector = sliced.forEach(function (oneVectorPose, index) {
//   setTimeout(() => {
//     console.log(oneVectorPose);
//   }, index * interval);
// });

// console.log("end");
//console.log("slicedvector", slicedvector); //undefined

const similarity = require("compute-cosine-similarity");
//sliced = is sliced array for each pose
//entry to similarity one by one with delay

function delay() {
  setTimeout(function similarityDistance(target, live) {
    const cosinesimilarity = similarity(sliced[1], sliced[2]);
    const distace = 2 * (1 - cosinesimilarity);
    const squaredDistance = Math.sqrt(distace);
    console.log("distance 1", squaredDistance);
    document.getElementById("similarityPose1").innerHTML =
      "you are " +
      Math.round(squaredDistance * 100) +
      "% similar with the pose";
    // return Math.sqrt(distace);
 
  }, 3000);
}
delay();

function delay2() {
  setTimeout(function similarityDistance(target, live) {
    const cosinesimilarity = similarity(sliced[2], sliced[2]);
    const distace2 = 2 * (1 - cosinesimilarity);
    const squaredDistance2 = Math.sqrt(distace2);
    console.log("distance 2", squaredDistance2);
    // return Math.sqrt(distace);
  }, 6000);
}
delay2();

function delay3() {
  setTimeout(function similarityDistance(target, live) {
    const cosinesimilarity = similarity(sliced[3], sliced[2]);
    const distace3 = 2 * (1 - cosinesimilarity);
    const squaredDistance3 = Math.sqrt(distace3);
    console.log("distance 3", squaredDistance3);
    // return Math.sqrt(distace);
  }, 9000);
}
delay3();

// similarityDistance();

// function delay() {
//   setTimeout(function () {
//     console.log("delay");
//   }, 3000);
// }
// function similarityDistance(target, live) {
//   const cosinesimilarity = similarity(sliced[2], sliced[2]);
//   const distace = 2 * (1 - cosinesimilarity);
//   console.log("distance 2", distace);
//   return Math.sqrt(distace);
// }
// similarityDistance();
// const interval = 3000;
// let slicedvector = sliced.forEach(function (oneVectorPose, index) {
//   setTimeout(() => {
//     console.log(oneVectorPose);
//     const cosinesimilarity = similarity(oneVectorPose[1], sliced[2]);
//   }, index * interval);
// });

//access to similarity //if its direct, can be calculated
// setTimeout(() => {// }, 3000);
// function similarityDistance(target, live) {
//   const cosinesimilarity = similarity(sliced[1], sliced[2]);
//   const distace = 2 * (1 - cosinesimilarity);
//   console.log("distance", distace);
//   return Math.sqrt(distace);
// }

//cant be done since there is a return value. set timeout will not run
// function similarityDistance() {
//   const cosinesimilarity = similarity(sliced[1], sliced[2]);
//     const distace = 2 * (1 - cosinesimilarity);
//     console.log("distance", distace);
//     return Math.sqrt(distace);
//     setTimeout(function() {
//       console.log(delay 3 second);
//     }
//   }
// }

//access to similarity and delay

//+++++++++++++get live keypoints+++++++++

// console.log("live keypoints", keypoints);
// // const pose = keypoints;
// // //console.log("pose keypoint", pose.keypoints); //undefined
// // const xPosLive = keypoints.map((k) => k.position.x);
// // console.log("map", xPosLive); //array of all keypoints

// //use foreach for outer loop

// //function inside loop as object

// //set up initializor for live data

// let l = 0;
// for (b in xPosLive) {
//   let xposL = xPosLive;
//   //let ypos = yPosition[i];
//   console.log("xpos", xposL);
//   //console.log("ypos", ypos);
//   let minXL = Math.min(...xposL); //non callable iterator
//   //let minY = Math.min(...ypos);
//   console.log("min x", minXL);
//   //console.log("min y", minY);

//   let vectorLive = [];
//   for (var m = 0; m < xposL.length; m++) {
//     vectorLive.push(xposL[m] - minXL);
//     //vector.push(ypos[j] - minY);
//   }
//   console.log("vector", vectorLive);
//   i++;
// }

// start using browserify to use npm cosine similarity

//get one pose to next

// const similarity = require("compute-cosine-similarity");

// function similarityDistance(vectorTarget, vectorLive) {
//   const cosinesimilarity = similarity(vectorTarget, vectorLive);
//   const distace = 2 * (1 - cosinesimilarity);
//   return Math.sqrt(distace);
// }

// similarityDistance();
