const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
    console.log('Success');
    startApp();
  }
  catch (error) {
    console.log('Something went wrong... Try again');
  }
};

const addImageWatermarkToImage = async function (inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
    console.log('Success');
    startApp();
  }
  catch (error) {
    console.log('Something went wrong... Try again');
  }
};

const imageBrighter = async function (inputFile, value, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
    image.color([
      { apply: 'brighten', params: [value] }
    ]);
    await image.quality(100).writeAsync(outputFile);
    console.log('Success');
  }
  catch (error) {
    console.log('Something went wrong... Try again');
  }
};

const imageIncreaseContrast = async function (inputFile, value, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
    image.contrast(parseFloat(value));
    await image.quality(100).writeAsync(outputFile);
    console.log('Success');
  }
  catch (error) {
    console.log('Something went wrong... Try again FFFFF');
  }
};

const imageBandW = async function (inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
    image.grayscale();
    await image.quality(100).writeAsync(outputFile);
    console.log('Success');
  }
  catch (error) {
    console.log('Something went wrong... Try again');
  }
};

const imageInver = async function (inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
    image.rotate(180);
    await image.quality(100).writeAsync(outputFile);
    console.log('Success');
  }
  catch (error) {
    console.log('Something went wrong... Try again');
  }
};

const prepareOutputFilename = function (fileName) {
  const fileSplit = fileName.split('.');
  const fullFileName = fileSplit[0] + '-with-watermark.' + fileSplit[1];
  return fullFileName;
};

const prepareOutputFilenameEdit = function (fileName) {
  const fileSplit = fileName.split('.');
  const fullFileName = fileSplit[0] + '-edit.' + fileSplit[1];
  return fullFileName;
};

const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([{
    name: 'start',
    message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
    type: 'confirm'
  }]);

  // if answer is no, just quit the app
  if (!answer.start) process.exit();

  // ask about input file
  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }]);

  // ask about edit options
  const editOptionsAnswer = await inquirer.prompt([{
    name: 'edit',
    message: 'Do you want edit your file?',
    type: 'confirm',
  }]);

  let inputImagePath = options.inputImage;

  if (editOptionsAnswer.edit) {
    const editOptions = await inquirer.prompt([{
      name: 'editType',
      type: 'list',
      choices: ['make image brighter', 'increase contrast', 'make image b&w', 'invert image'],
    }]);

    if (editOptions.editType === 'make image brighter') {
      const bright = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type bright value (number between 0 and 100):',
      }]);
      editOptions.brightValue = bright.value;
      if (fs.existsSync('./img/' + inputImagePath)) {
        imageBrighter('./img/' + inputImagePath, editOptions.brightValue, './img/' + prepareOutputFilenameEdit(options.inputImage));
      } else {
        console.log('Something went wrong... Try again');
      }
    } else if (editOptions.editType === 'increase contrast') {
      const contrast = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type contrast value (number between -1 and +1):',
      }]);
      editOptions.contrastValue = contrast.value;
      if (fs.existsSync('./img/' + inputImagePath)) {
        imageIncreaseContrast('./img/' + inputImagePath, editOptions.contrastValue, './img/' + prepareOutputFilenameEdit(options.inputImage));
      } else {
        console.log('Something went wrong... Try again');
      }
    } else if (editOptions.editType === 'make image b&w') {
      if (fs.existsSync('./img/' + inputImagePath)) {
        imageBandW('./img/' + inputImagePath, './img/' + prepareOutputFilenameEdit(options.inputImage));
      } else {
        console.log('Something went wrong... Try again');
      }
    } else if (editOptions.editType === 'invert image') {
      if (fs.existsSync('./img/' + inputImagePath)) {
        imageInver('./img/' + inputImagePath, './img/' + prepareOutputFilenameEdit(options.inputImage));
      } else {
        console.log('Something went wrong... Try again');
      }
    }
    inputImagePath = prepareOutputFilenameEdit(options.inputImage);
  }

  // ask about watermark type
  const watermarkOptions = await inquirer.prompt([{
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);

  if (watermarkOptions.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }]);
    watermarkOptions.watermarkText = text.value;
    if (fs.existsSync('./img/' + inputImagePath)) {
      addTextWatermarkToImage('./img/' + inputImagePath, './img/' + prepareOutputFilename(options.inputImage), watermarkOptions.watermarkText);
    } else {
      console.log('Something went wrong... Try again');
    }
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.png',
    }]);
    watermarkOptions.watermarkImage = image.filename;
    if ((fs.existsSync('./img/' + inputImagePath)) && (fs.existsSync('./img/' + watermarkOptions.watermarkImage))) {
      addImageWatermarkToImage('./img/' + inputImagePath, './img/' + prepareOutputFilename(options.inputImage), './img/' + watermarkOptions.watermarkImage);
    } else {
      console.log('Something went wrong... Try again');
    }
  }

}

startApp();