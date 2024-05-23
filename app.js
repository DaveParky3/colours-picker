//Global Selection and Variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');

const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');

const lockbutton = document.querySelectorAll('.lock');
const adjustButtons = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainer = document.querySelectorAll('.sliders');

let initialColors;

//for Local Storage - an array of objects
let savedPalettes = [];

//************************************************************************************ */
//Event Listeners

//generate new colors
generateBtn.addEventListener('click', randomColors);

//change colors with slider
sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
});
//update UI of Div
//we need a call back function when we want to use a parameter in a function, like index or hex
colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    });
});

//copy to clipboard
currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    });
});

//close pop up window
popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popupBox.classList.remove('active');
    popup.classList.remove('active');
});

//open and close adjustment sliders
adjustButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});
closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {

        closeAdjustmentPanel(index);
    });
});

//lock button
lockbutton.forEach((button, index) => {

    button.addEventListener('click', () => {
        //lockUnlock(index);
        colorDivs[index].classList.toggle('locked');
        if (colorDivs[index].classList.contains('locked')) {
            button.innerHTML = '<i class="fas fa-lock"></i>';
        } else {
            button.innerHTML = '<i class="fas fa-lock-open"></i>';
        }
    });
});

// function lockUnlock(index) {
//     const lockIcon = lockbutton[index].children[0];
//     if(lockIcon.classList.contains('fa-lock-open')){
//         lockIcon.classList.remove('fa-lock-open')
//         lockIcon.classList.add('fa-lock');
//         colorDivs[index].classList.add('locked');
//     } else {
//     lockIcon.classList.remove('fa-lock');
//     lockIcon.classList.add('fa-lock-open');
//     colorDivs[index].classList.remove('locked');

//     console.log(lockIcon);
//     }   
// }



//Functions

//Generate Random Color: using only JS
// function generateHex(){
//     const letters = '0123456789ABCDEF';
//     let hash ='#';
//     for(let i=0; i<6; i++){
//         hash += letters[Math.floor(Math.random()*16)];
//     }
//     return hash;
// }


//************************ Random colors for each color div **************************************
function randomColors() {
    initialColors = [];

    colorDivs.forEach((div, index) => {
        //get text and color
        //childer of div are h2
        const hexText = div.children[0];
        const randomColor = generateHex();

        //check lock button
        if (div.classList.contains('locked')) {
            //push the inizital value & return so it stops
            initialColors.push(hexText.innerText);
            return;
        } else {
            //save new random color to array
            initialColors.push(randomColor.hex());
        }

        //add color to background and text
        div.style.backgroundColor = randomColor;
        hexText.innerHTML = randomColor;

        //check for contrast of Hex TExt
        checkTextContrast(randomColor, hexText);

        //Inizial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);

    });
    //Reset Inputs
    resetInputs();

    //check for Constrast of buttons (adjust and lock)
    adjustButtons.forEach((button, index) => {
        //refers to adjust buttons
        checkTextContrast(initialColors[index], button);
        //refres to lock buttons
        checkTextContrast(initialColors[index], lockbutton[index]);
        //lockbutton[index] are all the lock buttons
    }
    );
}

//Generate Random Color: using chroma.js
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}

//check contrast of text and icons and buttons
function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

//Load colors to sliders
function colorizeSliders(color, hue, brightness, saturation) {
    //Scale Saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    //Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);

    //Update input color
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204,204 ,75),rgb(75, 204, 75),rgb(75, 204, 204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)},${scaleBright(0.5)}, ${scaleBright(1)})`;

}

//set sliders input to current color
function resetInputs() {
    //const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if (slider.name === 'hue') {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === 'saturation') {
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
        if (slider.name === 'brightness') {
            const brigthColor = initialColors[slider.getAttribute('data-bright')];
            const brigthValue = chroma(brigthColor).hsl()[2];

            //to only get two digita after comma: floor(n*100) /100
            //console.log(brigthValue *100);  ---from 0.644567834 to 64.45
            //Math.floor(of that number ) --64 ---- /100, 0.64

            slider.value = Math.floor(brigthValue * 100) / 100;
        }
    });
}
//***************************** End part of generate randomColor()  ***************************




//CallBacks Functions for other Event Listeners

//Change colors of Divs from Slider
function hslControls(e) {
    // use 'or' to indeitify index of multiple sliders in same variable
    const index = e.target.getAttribute('data-hue') ||
        e.target.getAttribute('data-bright') ||
        e.target.getAttribute('data-sat');

    //e.target is the input, to select all the sliders I need to go up to the parentElement  = main Div Sliders
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    //color of the div bg when I click on an input - I just need the text so I get the color in Hex
    // const bgColor = colorDivs[index].querySelector('h2').innerText;
    const bgColor = initialColors[index];

    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value)
    colorDivs[index].style.backgroundColor = color;

    //colorize sliders
    colorizeSliders(color, hue, brightness, saturation);
}

//Change text shown on div
function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');

    //add color of div to text of div, converted from rgb to hex 
    textHex.innerText = color.hex();
    //check contrast
    checkTextContrast(color, textHex);

    for (icon of icons) {
        checkTextContrast(color, icon);
    }
}

//open and close adjust container
function openAdjustmentPanel(index) {
    sliderContainer[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    sliderContainer[index].classList.remove('active');
}



//********************************** Click to Copy ******************************************

function copyToClipboard(hex) {
    //we can copy it from a text area, so we create one and make it equal to hex text
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    //once it's there we can select it (this is runny on click)
    el.select();
    //and copy it with execCommnad('copy)
    document.execCommand('copy');
    //then we can remove it
    document.body.removeChild(el);

    //pop up animation
    //on the whole dive
    popup.classList.add('active');
    //on just the box div
    const popupBox = popup.children[0];
    popupBox.classList.add('active');
}



// ********************  Save Palettes and Local Storage Stuff *************************
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

//Event Listeners
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e) {
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e) {
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    //Generate object
let paletteNrm; //= savedPalettes.length;

    //Check if we have someting in localStorage
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if (paletteObjects) {
        paletteNrm = paletteObjects.length;
    } else {
        paletteNrm = savedPalettes.length;
    }


    // const paletteObj = {name : name, colors: colors}; because key is equal to the value we can shorten it
    const paletteObj = { name, colors, nr: paletteNrm };
    savedPalettes.push(paletteObj);
    //Save to localStorage
    saveToLocal(paletteObj);
    //reset input
    saveInput.value = '';

    //Generate Main Div Palettes for Library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');

    //Palette Title
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;

    //Palette Preview (main div which contains colors div)
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });

    //Buttom to Select palette from library
    const paletteButton = document.createElement('button');
    paletteButton.classList.add('pick-palette-btn');
    //add num to identifu which palette I'm selecting 
    paletteButton.classList.add(paletteObj.nr);
    paletteButton.innerText = "Select";

    paletteButton.addEventListener('click', e => {
        closeLibrary();
        //select paletteObj.nr
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        //this select the object of based on the index/ the one clicked, add get its color
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            //update colors on screen
            colorDivs[index].style.backgroundColor = color;
            //change h2: color text
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);

            updateTextUI(index);
        });
        resetInputs();
    });

    //Append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteButton);
    //add all the above to the library pop up
    libraryContainer.children[0].appendChild(palette);

}

function saveToLocal(paletteObj) {
    let localPalettes;
    //check if empty, add empty array, if not get the existing palettes
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }

    //add palettes obj to arrat and save it to local storage
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));

    // saveInput.value = '';
    // closePalette();
}

function openLibrary(e) {
    const popup = libraryContainer.children[0];
    console.log(libraryContainer);
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary(e) {
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal() {
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
       
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
            //re create the preview div etc
            //Generate Main Div Palettes for Library
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });

            //Buttom to Select palette from library
            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            //add num to identifu which palette I'm selecting 
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";

            paletteBtn.addEventListener('click', e => {
                closeLibrary();
                //select paletteObj.nr
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                //this select the object of based on the index/ the one clicked, add get its color
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    //change h2: color text
                    //const text = colorDivs[index].children[0];
                    //checkTextContrast(color, text);

                    updateTextUI(index);
                });
                resetInputs();
            });

            //Append to Library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            //add all the above to the library pop up
            libraryContainer.children[0].appendChild(palette);


        });
    }
}

getLocal();
randomColors();

//  localStorage.clear();