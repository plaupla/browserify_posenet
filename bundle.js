(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
//import * as posenet from '@tensorflow-models/posenet';
//import dat from 'dat.gui';
//import Stats from 'stats.js';

//import {drawBoundingBox, drawKeypoints, drawSkeleton, isMobile, toggleLoadingUI, tryResNetButtonName, tryResNetButtonText, updateTryResNetButtonDatGuiCss} from './demo_util';

const videoWidth = 600;
const videoHeight = 500;
//const stats = new Stats();

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const video = document.getElementById("video");
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = isMobile() ? 0.5 : 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

const guiState = {
  algorithm: "multi-pose",
  input: {
    architecture: "MobileNetV1",
    outputStride: defaultMobileNetStride,
    inputResolution: defaultMobileNetInputResolution,
    multiplier: defaultMobileNetMultiplier,
    quantBytes: defaultQuantBytes,
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
  },
  multiPoseDetection: {
    maxPoseDetections: 5,
    minPoseConfidence: 0.15,
    minPartConfidence: 0.1,
    nmsRadius: 30.0,
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras, net) {
  guiState.net = net;

  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId;
  }

  const gui = new dat.GUI({ width: 300 });

  let architectureController = null;
  guiState[tryResNetButtonName] = function () {
    architectureController.setValue("ResNet50");
  };
  gui.add(guiState, tryResNetButtonName).name(tryResNetButtonText);
  updateTryResNetButtonDatGuiCss();

  // The single-pose algorithm is faster and simpler but requires only one
  // person to be in the frame or results will be innaccurate. Multi-pose works
  // for more than 1 person
  const algorithmController = gui.add(guiState, "algorithm", [
    "single-pose",
    "multi-pose",
  ]);

  // The input parameters have the most effect on accuracy and speed of the
  // network
  let input = gui.addFolder("Input");
  // Architecture: there are a few PoseNet models varying in size and
  // accuracy. 1.01 is the largest, but will be the slowest. 0.50 is the
  // fastest, but least accurate.
  architectureController = input.add(guiState.input, "architecture", [
    "MobileNetV1",
    "ResNet50",
  ]);
  guiState.architecture = guiState.input.architecture;
  // Input resolution:  Internally, this parameter affects the height and width
  // of the layers in the neural network. The higher the value of the input
  // resolution the better the accuracy but slower the speed.
  let inputResolutionController = null;
  function updateGuiInputResolution(inputResolution, inputResolutionArray) {
    if (inputResolutionController) {
      inputResolutionController.remove();
    }
    guiState.inputResolution = inputResolution;
    guiState.input.inputResolution = inputResolution;
    inputResolutionController = input.add(
      guiState.input,
      "inputResolution",
      inputResolutionArray
    );
    inputResolutionController.onChange(function (inputResolution) {
      guiState.changeToInputResolution = inputResolution;
    });
  }

  // Output stride:  Internally, this parameter affects the height and width of
  // the layers in the neural network. The lower the value of the output stride
  // the higher the accuracy but slower the speed, the higher the value the
  // faster the speed but lower the accuracy.
  let outputStrideController = null;
  function updateGuiOutputStride(outputStride, outputStrideArray) {
    if (outputStrideController) {
      outputStrideController.remove();
    }
    guiState.outputStride = outputStride;
    guiState.input.outputStride = outputStride;
    outputStrideController = input.add(
      guiState.input,
      "outputStride",
      outputStrideArray
    );
    outputStrideController.onChange(function (outputStride) {
      guiState.changeToOutputStride = outputStride;
    });
  }

  // Multiplier: this parameter affects the number of feature map channels in
  // the MobileNet. The higher the value, the higher the accuracy but slower the
  // speed, the lower the value the faster the speed but lower the accuracy.
  let multiplierController = null;
  function updateGuiMultiplier(multiplier, multiplierArray) {
    if (multiplierController) {
      multiplierController.remove();
    }
    guiState.multiplier = multiplier;
    guiState.input.multiplier = multiplier;
    multiplierController = input.add(
      guiState.input,
      "multiplier",
      multiplierArray
    );
    multiplierController.onChange(function (multiplier) {
      guiState.changeToMultiplier = multiplier;
    });
  }

  // QuantBytes: this parameter affects weight quantization in the ResNet50
  // model. The available options are 1 byte, 2 bytes, and 4 bytes. The higher
  // the value, the larger the model size and thus the longer the loading time,
  // the lower the value, the shorter the loading time but lower the accuracy.
  let quantBytesController = null;
  function updateGuiQuantBytes(quantBytes, quantBytesArray) {
    if (quantBytesController) {
      quantBytesController.remove();
    }
    guiState.quantBytes = +quantBytes;
    guiState.input.quantBytes = +quantBytes;
    quantBytesController = input.add(
      guiState.input,
      "quantBytes",
      quantBytesArray
    );
    quantBytesController.onChange(function (quantBytes) {
      guiState.changeToQuantBytes = +quantBytes;
    });
  }

  function updateGui() {
    if (guiState.input.architecture === "MobileNetV1") {
      updateGuiInputResolution(
        defaultMobileNetInputResolution,
        [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800]
      );
      updateGuiOutputStride(defaultMobileNetStride, [8, 16]);
      updateGuiMultiplier(defaultMobileNetMultiplier, [0.5, 0.75, 1.0]);
    } else {
      // guiState.input.architecture === "ResNet50"
      updateGuiInputResolution(
        defaultResNetInputResolution,
        [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800]
      );
      updateGuiOutputStride(defaultResNetStride, [32, 16]);
      updateGuiMultiplier(defaultResNetMultiplier, [1.0]);
    }
    updateGuiQuantBytes(defaultQuantBytes, [1, 2, 4]);
  }

  updateGui();
  input.open();
  // Pose confidence: the overall confidence in the estimation of a person's
  // pose (i.e. a person detected in a frame)
  // Min part confidence: the confidence that a particular estimated keypoint
  // position is accurate (i.e. the elbow's position)
  let single = gui.addFolder("Single Pose Detection");
  single.add(guiState.singlePoseDetection, "minPoseConfidence", 0.0, 1.0);
  single.add(guiState.singlePoseDetection, "minPartConfidence", 0.0, 1.0);

  let multi = gui.addFolder("Multi Pose Detection");
  multi
    .add(guiState.multiPoseDetection, "maxPoseDetections")
    .min(1)
    .max(20)
    .step(1);
  multi.add(guiState.multiPoseDetection, "minPoseConfidence", 0.0, 1.0);
  multi.add(guiState.multiPoseDetection, "minPartConfidence", 0.0, 1.0);
  // nms Radius: controls the minimum distance between poses that are returned
  // defaults to 20, which is probably fine for most use cases
  multi.add(guiState.multiPoseDetection, "nmsRadius").min(0.0).max(40.0);
  multi.open();

  let output = gui.addFolder("Output");
  output.add(guiState.output, "showVideo");
  output.add(guiState.output, "showSkeleton");
  output.add(guiState.output, "showPoints");
  output.add(guiState.output, "showBoundingBox");
  output.open();

  architectureController.onChange(function (architecture) {
    // if architecture is ResNet50, then show ResNet50 options
    updateGui();
    guiState.changeToArchitecture = architecture;
  });

  algorithmController.onChange(function (value) {
    switch (guiState.algorithm) {
      case "single-pose":
        multi.close();
        single.open();
        break;
      case "multi-pose":
        single.close();
        multi.open();
        break;
    }
  });
}

/**
 * Sets up a frames per second panel on the top-left of the window
 */
//function setupFPS() {
//  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
//  document.getElementById('main').appendChild(stats.dom);
//}

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");

  // since images are being fed from a webcam, we want to feed in the
  // original image and then just flip the keypoints' x coordinates. If instead
  // we flip the image, then correcting left-right keypoint pairs requires a
  // permutation on all the keypoints.
  const flipPoseHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    if (guiState.changeToArchitecture) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.changeToArchitecture,
        outputStride: guiState.outputStride,
        inputResolution: guiState.inputResolution,
        multiplier: guiState.multiplier,
      });
      toggleLoadingUI(false);
      guiState.architecture = guiState.changeToArchitecture;
      guiState.changeToArchitecture = null;
    }

    if (guiState.changeToMultiplier) {
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: guiState.outputStride,
        inputResolution: guiState.inputResolution,
        multiplier: +guiState.changeToMultiplier,
        quantBytes: guiState.quantBytes,
      });
      toggleLoadingUI(false);
      guiState.multiplier = +guiState.changeToMultiplier;
      guiState.changeToMultiplier = null;
    }

    if (guiState.changeToOutputStride) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: +guiState.changeToOutputStride,
        inputResolution: guiState.inputResolution,
        multiplier: guiState.multiplier,
        quantBytes: guiState.quantBytes,
      });
      toggleLoadingUI(false);
      guiState.outputStride = +guiState.changeToOutputStride;
      guiState.changeToOutputStride = null;
    }

    if (guiState.changeToInputResolution) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: guiState.outputStride,
        inputResolution: +guiState.changeToInputResolution,
        multiplier: guiState.multiplier,
        quantBytes: guiState.quantBytes,
      });
      toggleLoadingUI(false);
      guiState.inputResolution = +guiState.changeToInputResolution;
      guiState.changeToInputResolution = null;
    }

    if (guiState.changeToQuantBytes) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: guiState.outputStride,
        inputResolution: guiState.inputResolution,
        multiplier: guiState.multiplier,
        quantBytes: guiState.changeToQuantBytes,
      });
      toggleLoadingUI(false);
      guiState.quantBytes = guiState.changeToQuantBytes;
      guiState.changeToQuantBytes = null;
    }

    // Begin monitoring code for frames per second
    //stats.begin();

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    switch (guiState.algorithm) {
      case "single-pose":
        const pose = await guiState.net.estimatePoses(video, {
          flipHorizontal: flipPoseHorizontal,
          decodingMethod: "single-person",
        });
        poses = poses.concat(pose);
        minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
        break;
      case "multi-pose":
        let all_poses = await guiState.net.estimatePoses(video, {
          flipHorizontal: flipPoseHorizontal,
          decodingMethod: "multi-person",
          maxDetections: guiState.multiPoseDetection.maxPoseDetections,
          scoreThreshold: guiState.multiPoseDetection.minPartConfidence,
          nmsRadius: guiState.multiPoseDetection.nmsRadius,
        });

        poses = poses.concat(all_poses);
        minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
        break;
    }

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (guiState.output.showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      ctx.restore();
    }

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores
    poses.forEach(({ score, keypoints }) => {
      if (score >= minPoseConfidence) {
        if (guiState.output.showPoints) {
          drawKeypoints(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showSkeleton) {
          drawSkeleton(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showBoundingBox) {
          drawBoundingBox(keypoints, ctx);
        }
      }

      //start calculation

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
            85.56370538496321, 71.22695982224283, 69.22882911296207,
            5.01222424933883, 83.33888131820737, 166.1477910498237,
            173.38871106099526, 308.8786007179824, 308.1592936831226,
            396.97426384061225, 396.21247020676907, 467.60412431412635,
            466.45403672748967, 529.1653074271948, 529.1653074271948,
            552.0796203613281, 541.320951587959,
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
            429.3411747676389, 523.0347047798365, 414.130466327593,
            522.1977275447623, 522.1977275447623, 457.6881177137798,
            420.64827648118313, 526.9878657597048, 477.9423569519696,
            522.5579486653962, 482.556007474313,
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
            336.352955858995, 355.4066214951096, 311.7163169059308,
            378.5555424671693, 268.1603327057241, 437.9639076351656,
            219.9134796973796, 525.1298962307347, 82.25481441512646,
            523.7099311323946, 167.02761638953064, 404.7144409654669,
            196.1810368044367, 449.0233246918318, 78.51449610194344,
            480.695506589422, 117.65611982531121,
          ],
          ypos: [
            97.04585568914155, 78.02745640973637, 76.6646991536775,
            96.07150304178319, 92.41819745371777, 175.7582513831469,
            194.2611436064605, 306.49478897510335, 275.6953807192554,
            398.1991871785561, 166.33133647042953, 469.9905834865941,
            463.8099925712853, 575.5666924265108, 499.5733250718173,
            570.6507784476076, 539.9677867369893,
          ],
        },
        {
          pose: "pose4",
          xpos: [
            353.37602904798456, 369.4632385491397, 330.40533043531127,
            392.9562692605104, 290.90744077927405, 446.2685195388497,
            223.3405764093659, 531.2253816953429, 117.60189442319165,
            540.466997317303, 228.91199727930447, 438.67530603817,
            232.75720677950966, 395.0450561760928, 124.23755927772373,
            395.5916470776272, 154.98512772734526,
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
            43.08674140663, 361.12389382685205, 320.7437205036327,
            381.7155616849313, 282.4466847816794, 407.4782363357247,
            217.89175308168166, 524.5052494984193, 125.19324098579615,
            503.3304901716774, 243.2793518541388, 427.17898595193947,
            226.34599025147435, 448.5211003522465, 120.26861406022009,
            487.389474712921, 151.60628085006536,
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
            99.21747704888134, 80.64097630838475, 79.27113327070896,
            95.6744337267449, 89.11386452760215, 170.12238617537088,
            170.5829474898164, 319.85377656810476, 293.396684817303,
            353.7120988304049, 346.50967727839253, 448.99363358197047,
            434.58902262528125, 521.842846406573, 509.27490471865883,
            549.5710695021811, 548.0888806057347,
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
            99.49594816809034, 77.8051607896382, 80.30079919540464,
            88.90601429030124, 88.83380756303958, 168.53598984299003,
            172.5081293128344, 325.1392836515078, 284.82424546772404,
            366.4230631668744, 232.60254974958963, 457.20059643459695,
            434.48987463568903, 539.4949839551161, 553.0203131293508,
            548.3686947358722, 540.1465271233585,
          ],
        },
        {
          pose: "pose9",
          xpos: [
            340.2979133101289, 357.3787459881853, 320.0278824683757,
            381.509182109907, 285.76426227732856, 427.9985859792984,
            241.71782200438503, 508.629138516081, 130.1155583125608,
            390.00111026986565, 170.88957077798213, 383.6515030322836,
            216.6254350832928, 462.7880241898711, 125.8377372058913,
            497.70247641240576, 160.60577986305327,
          ],
          ypos: [
            89.54887301077639, 70.7358019639546, 71.53358607904457,
            83.55068666925689, 81.93717956542969, 167.6801101150216,
            186.23677294541892, 322.48729987830967, 301.8285052228994,
            366.3546230449751, 187.20178863881625, 467.8020124027238,
            458.2207491982308, 570.1930480244558, 554.5680281345947,
            553.2595896442576, 545.0840325856487,
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
            369.5803631140564, 385.671676457624, 458.7542795856639,
            455.4772521735165, 560.8488799811337, 540.361038386126,
            545.378539089099, 546.5448081168684,
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
            82.55307030585027, 81.91082520243722, 157.7832859499445,
            174.421531588187, 289.52246283742704, 305.76643650633815,
            234.5700951958445, 387.2419756581347, 442.5170266118031,
            437.38365110256325, 576.4353794439294, 538.8764662686953,
            570.3803760810584, 539.6478200237111,
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
            445.8504186251748, 570.8018083980576, 533.967829010366,
            571.2452240583962, 538.8043212890625,
          ],
        },
        {
          pose: "pose13",
          xpos: [
            338.41225590687316, 355.21071467418153, 315.87973242140004,
            378.38232968104023, 274.19273613955727, 421.7554518406493,
            213.3405989709995, 517.097552110249, 117.12701018218401,
            552.972455154597, 150.6275043413333, 455.7871397738327,
            221.53676311329644, 482.4750818631065, 147.9674544872477,
            482.3688064753313, 157.39926156366846,
          ],
          ypos: [
            96.2918447056633, 77.62438955937841, 76.0972752552552,
            91.38114840140139, 87.45391608212245, 169.5519983907618,
            173.97316543044747, 299.8198299185311, 306.97488747682087,
            392.13241102166677, 391.0415275365926, 455.3677783773103,
            456.988785443139, 558.827905024072, 535.6223068534168,
            558.9190228532724, 540.9849019922635,
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
      //console.log(sliced);

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
          //console.log("distance 1", squaredDistance);
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
    });

    // End monitoring code for frames per second
    //stats.end();

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
async function bindPage() {
  toggleLoadingUI(true);
  const net = await posenet.load({
    architecture: guiState.input.architecture,
    outputStride: guiState.input.outputStride,
    inputResolution: guiState.input.inputResolution,
    multiplier: guiState.input.multiplier,
    quantBytes: guiState.input.quantBytes,
  });
  toggleLoadingUI(false);

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById("info");
    info.textContent =
      "this browser does not support video capture," +
      "or this device does not have a camera";
    info.style.display = "block";
    throw e;
  }

  setupGui([], net);
  //setupFPS();  // dont need STATS.js
  detectPoseInRealTime(video, net);
}

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
// kick off the demo
bindPage();

},{"compute-cosine-similarity":2}],2:[function(require,module,exports){
'use strict';

// MODULES //

var dot = require( 'compute-dot' ),
	l2norm = require( 'compute-l2norm' ),
	isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// FUNCTIONS //

/**
 * FUNCTION: partial( fn, j )
 *	Partially applied function from the right.
 *
 * @private
 * @param {Function} fn - input function
 * @param {Number} j - array index
 * @returns {Function} partially applied function
 */
function partial( fn, j ) {
	return function accessor( d, i ) {
		return fn( d, i, j );
	};
} // end FUNCTION partial()


// COSINE SIMILARITY //

/**
* FUNCTION: similarity( x, y[, accessor] )
*	Computes the cosine similarity between two arrays.
*
* @param {Number[]|Array} x - input array
* @param {Number[]|Array} y - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} cosine similarity or null
*/
function similarity( x, y, clbk ) {
	var a, b, c;
	if ( !isArray( x ) ) {
		throw new TypeError( 'cosine-similarity()::invalid input argument. First argument must be an array. Value: `' + x + '`.' );
	}
	if ( !isArray( y ) ) {
		throw new TypeError( 'cosine-similarity()::invalid input argument. Second argument must be an array. Value: `' + y + '`.' );
	}
	if ( arguments.length > 2 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'cosine-similarity()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	if ( x.length !== y.length ) {
		throw new Error( 'cosine-similarity()::invalid input argument. Input arrays must have the same length.' );
	}
	if ( !x.length ) {
		return null;
	}
	if ( clbk ) {
		a = dot( x, y, clbk );
		b = l2norm( x, partial( clbk, 0 ) );
		c = l2norm( y, partial( clbk, 1 ) );
	} else {
		a = dot( x, y );
		b = l2norm( x );
		c = l2norm( y );
	}
	return a / ( b*c );
} // end FUNCTION similarity()


// EXPORTS //

module.exports = similarity;

},{"compute-dot":3,"compute-l2norm":4,"validate.io-array":5,"validate.io-function":6}],3:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// DOT PRODUCT //

/**
* FUNCTION: dot( x, y[, accessor] )
*	Computes the dot product between two arrays.
*
* @param {Array} x - input array
* @param {Array} y - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} dot product
*/
function dot( x, y, clbk ) {
	if ( !isArray( x ) ) {
		throw new TypeError( 'dot()::invalid input argument. First argument must be an array. Value: `' + x + '`.' );
	}
	if ( !isArray( y ) ) {
		throw new TypeError( 'dot()::invalid input argument. Second argument must be an array. Value: `' + y + '`.' );
	}
	if ( arguments.length > 2 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'dot()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	var len = x.length,
		sum = 0,
		i;

	if ( len !== y.length ) {
		throw new Error( 'dot()::invalid input argument. Arrays must be of equal length.' );
	}
	if ( !len ) {
		return null;
	}
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			sum += clbk( x[ i ], i, 0 ) * clbk( y[ i ], i, 1 );
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			sum += x[ i ] * y[ i ];
		}
	}
	return sum;
} // end FUNCTION dot()


// EXPORTS //

module.exports = dot;

},{"validate.io-array":5,"validate.io-function":6}],4:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// L2NORM //

/**
* FUNCTION: l2norm( arr[, accessor] )
*	Calculates the L2 norm (Euclidean norm) of an array.
*
* @param {Array} arr - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} L2 norm or null
*/
function l2norm( arr, clbk ) {
	if ( !isArray( arr ) ) {
		throw new TypeError( 'l2norm()::invalid input argument. Must provide an array.  Value: `' + arr + '`.' );
	}
	if ( arguments.length > 1 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'l2norm()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	var len = arr.length,
		t = 0,
		s = 1,
		r,
		val,
		abs,
		i;

	if ( !len ) {
		return null;
	}
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			val = clbk( arr[ i ], i );
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			val = arr[ i ];
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	}
	return t * Math.sqrt( s );
} // end FUNCTION l2norm()


// EXPORTS //

module.exports = l2norm;

},{"validate.io-array":5,"validate.io-function":6}],5:[function(require,module,exports){
'use strict';

/**
* FUNCTION: isArray( value )
*	Validates if a value is an array.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is an array
*/
function isArray( value ) {
	return Object.prototype.toString.call( value ) === '[object Array]';
} // end FUNCTION isArray()

// EXPORTS //

module.exports = Array.isArray || isArray;

},{}],6:[function(require,module,exports){
/**
*
*	VALIDATE: function
*
*
*	DESCRIPTION:
*		- Validates if a value is a function.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isFunction( value )
*	Validates if a value is a function.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a function
*/
function isFunction( value ) {
	return ( typeof value === 'function' );
} // end FUNCTION isFunction()


// EXPORTS //

module.exports = isFunction;

},{}]},{},[1]);
