export const playSound = (soundName: string) => {
    try {
        const audio = new Audio(`/sounds/${soundName}.mp3`);
        audio.volume = 0.5;
        audio.play().catch(e => {
            // Ignore auto-play errors or missing files
            // console.warn(`Failed to play sound: ${soundName}`, e);
        });
    } catch (e) {
        console.error(e);
    }
};
