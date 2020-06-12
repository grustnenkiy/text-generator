import htmlToImage from 'html-to-image';
import {fontMap} from './fontMap';

const generateButton = document.getElementsByClassName('generate-button')[0];
const saveButton = document.getElementsByClassName('save-button')[0];
const input = document.getElementsByClassName('phrase-input')[0];
const result = document.getElementsByClassName('result')[0];

const textBlockDirections = {
    horizontal: 1,
    vertical: 2
};

generateButton.onclick = () => updateResult();
saveButton.onclick = () => saveResult();

input.onkeyup = (event) => {
    if (event.keyCode === 13) {
        updateResult();
    }
}

/////

const updateResult = () => {
    if (input.value) {
        let text = input.value.replace(/[\s\?'",;:\.]*/g, '').toUpperCase();
        let direction = getTextBlockDirection();
        result.innerHTML = generateTextMatrixHtml(text, direction);
    }
}

const saveResult = () => {
    const node = document.getElementById('resultImg');

    htmlToImage.toPng(node)
    .then(function (dataUrl) {
      let img = new Image();
      img.src = dataUrl;
      document.body.appendChild(img);
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error);
    });
}

const getTextBlockDirection = () => {
    let radioList = document.getElementsByName('phrase_radio');
    for (let i = 0; i < radioList.length; i++) {
        if (radioList[i].type == "radio" && radioList[i].checked) {
            return textBlockDirections[radioList[i].value];
        }
    }
}

/////

const generateTextMatrixHtml = (text, direction) => {
    let alternates = [];

    for (let i = 0; i < text.length; i++) {
        alternates.push(getRandomInt(1, 3));
    }

    if (direction === textBlockDirections.horizontal) {
        return getHtmlForHorizontalTextBlock(text, alternates);
    }

    if (direction === textBlockDirections.vertical) {
        return getHtmlForVerticalTextBlock(text, alternates);
    }

    return getHtmlForHorizontalTextBlock(text, alternates);
}

const getHtmlForHorizontalTextBlock = (text, alternates) => {
    let size_y = Math.ceil(Math.sqrt(text.length));
    let size_x = Math.ceil(text.length / size_y);
    size_y -= 1;

    let lineCapacity = size_x * 2 + 1;

    return getHtmlForText(formAlternatesResultArr(text, alternates, size_x, size_y, lineCapacity), text, lineCapacity);
}

const getHtmlForVerticalTextBlock = (text, alternates) => {
    let size_x = Math.ceil(Math.sqrt(text.length) / 2);
    let size_y = Math.ceil(text.length / size_x) - 1;

    let lineCapacity = size_x * 2 + 1;

    return getHtmlForText(formAlternatesResultArr(text, alternates, size_x, size_y, lineCapacity), text, lineCapacity);
}

const formAlternatesResultArr = (text, alternates, size_x, size_y, lineCapacity) => {
    let alternatesResultArr = [];
    let textLineArr = [];
    let count = 0;
    let sum = 0;
    let linesNumber = 0;
    let size_x_tmp = size_x;

    let blockSize = size_x * size_y;
    let restOfText = text.length - blockSize;

    let restOfTextPositions = [];

    for (let i = 0; i < restOfText; i++) {
        restOfTextPositions[i] = getRandomInt(0, size_y - 1);
    }

    while (count < alternates.length) {
        if (textLineArr.length === 0) {
            size_x_tmp = size_x;
            let filtered = restOfTextPositions.filter(p => p === linesNumber);
            if (filtered.length) {
                size_x_tmp = size_x + filtered.length;
            }
        }

        textLineArr.push(alternates[count]);
        sum += alternates[count];

        if (textLineArr.length === size_x_tmp) {
            alternatesResultArr = alternatesResultArr.concat(formTextLine(textLineArr, sum, lineCapacity));
            textLineArr = [];
            sum = 0;
            linesNumber += 1;
        }

        ++count;
    }

    return alternatesResultArr;
}

const formTextLine = (textLineArr, textLineSum, lineCapacity) => {
    while (textLineSum !== lineCapacity) {
        if (textLineSum < lineCapacity) {
            increaseTextLineSum(textLineArr);
            ++textLineSum;
        }

        if (textLineSum > lineCapacity) {
            decreaseTextLineSum(textLineArr);
            --textLineSum;
        }
    }

    return textLineArr;
}

const increaseTextLineSum = (textLineArr) => {
    for (let i = 0; i < textLineArr.length; i++) {
        if (textLineArr[i] < 3) {
            textLineArr[i] += 1;
            break;
        }
    }
}

const decreaseTextLineSum = (textLineArr, textLineSum) => {
    for (let i = 0; i < textLineArr.length; i++) {
        if (textLineArr[i] > 1) {
            textLineArr[i] -= 1;
            break;
        }
    }
}

const getHtmlForText = (alternatesResultArr, text, lineCapacity) => {
    let result = '';
    let sum = 0;
    result += '<div>';

    for (let i = 0; i < alternatesResultArr.length; i++) {

        if (sum % lineCapacity === 0) {
            result += '</div>';
            result += '<div>';
            sum = 0;
        }

        let symbolAlternates = fontMap[text[i]][alternatesResultArr[i]];
        result += `<span class="aalt-${symbolAlternates[getRandomInt(0, symbolAlternates.length - 1)]}">${text[i]}</span>`;
        sum += alternatesResultArr[i];
    }

    return result;
}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//////// HELPERS FOR TEST
const getAlternates = () => {
    let lettersString = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЬЫЪЭЮЯ';
    let alternatesCount = 15;

    let result = '';
    for (let i = 0; i < lettersString.length; i++) {
        result += '<div>';
        for (let j = 0; j < alternatesCount; j++) {
            result += `<span class="indent"><span class="aalt-${j}">${lettersString[i]}</span><span class="index">${j}</span></span>`;
        }
        result += '</div>';
    }
    return result;
}