const clockFrequency = 14745600;
const timerPreScale = 256;

const baudRate = 9600;
const multiplier = baudRate * 16;
define("baudSelector", (clockFrequency / multiplier) - 1);

const shiftMap = new Map([
    [0,    0],
    [1,    1 << CS10],
    [8,    1 << CS11],
    [64,   (1 << CS11) | (1 << CS10)],
    [256,  (1 << CS12)],
    [1024, (1 << CS12) | (1 << CS10)]
]);
define("clockSelect", shiftMap.get(timerPreScale));

const halfPeriodMilliseconds = 20;
const timerFrequency = clockFrequency / timerPreScale;
const tick = (1 / timerFrequency) * 1000;
const ticks = halfPeriodMilliseconds / tick;
define("ticks", Math.round(ticks));
