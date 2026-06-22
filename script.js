console.log("OS Booting")
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
}
setInterval(updateClock, 1000); // Updates every second
updateClock();

function makeDraggable(windowElement) {
    const titleBar = windowElement.querySelector('#titlebar');
    const iframe = windowElement.querySelector('iframe'); // Select the iframe
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;

        // --- POINT 1: Disable iframe interaction while dragging ---
        if (iframe) iframe.style.pointerEvents = 'none';

        const moveHandler = (moveEvent) => {
            windowElement.style.left = `${moveEvent.clientX - offsetX}px`;
            windowElement.style.top = `${moveEvent.clientY - offsetY}px`;
        };

        const upHandler = () => {
            // --- POINT 2: Re-enable interaction after drop ---
            if (iframe) iframe.style.pointerEvents = 'auto';
            
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    });
}

function makeResizable(windowElement) {
    const handle = windowElement.querySelector('.resize-handle');
    const iframe = windowElement.querySelector('iframe');

    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation(); 
        
        const startWidth = windowElement.offsetWidth;
        const startHeight = windowElement.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;

        
        if (iframe) iframe.style.pointerEvents = 'none';

        const onMouseMove = (moveEvent) => {
            windowElement.style.width = (startWidth + (moveEvent.clientX - startX)) + 'px';
            windowElement.style.height = (startHeight + (moveEvent.clientY - startY)) + 'px';
        };

        const onMouseUp = () => {
            if (iframe) iframe.style.pointerEvents = 'auto';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function toggleMaximize(windowDiv) {
    if (!windowDiv.state.isMaximized) {
        // Save current bounds
        windowDiv.state.savedBounds = {
            top: windowDiv.style.top,
            left: windowDiv.style.left,
            width: windowDiv.style.width,
            height: windowDiv.style.height
        };
        // Apply full screen
        Object.assign(windowDiv.style, {
            top: '0px', left: '0px', width: '100vw', height: '100vh', borderRadius: '0px'
        });
    } else {
        // Restore bounds
        Object.assign(windowDiv.style, {
            top: windowDiv.state.savedBounds.top,
            left: windowDiv.state.savedBounds.left,
            width: windowDiv.state.savedBounds.width,
            height: windowDiv.state.savedBounds.height,
            borderRadius: '16px'
        });
    }
    windowDiv.state.isMaximized = !windowDiv.state.isMaximized;
}


let highestZ = 10;

function openApp(appName) {
    const existingWindow = document.querySelector(`[data-app="${appName}"]`);

    if (existingWindow) {
        if (existingWindow.style.display === 'none') {
            existingWindow.style.display = 'flex';
        }
        existingWindow.style.zIndex = highestZ++;
        return;
    }
    const windowDiv = document.createElement('div');
    windowDiv.dataset.app = appName;
    windowDiv.state = { isMaximized: false, savedBounds: {} };
    windowDiv.style.zIndex = highestZ++;
    windowDiv.className = "absolute top-20 left-20 w-80 h-60 min-w-[200px] min-h-[150px] bg-white/30 backdrop-blur-md border border-white/50 rounded-2xl flex flex-col overflow-hidden";
    
    windowDiv.innerHTML = `
        <div id="titlebar" class="h-8 bg-black/5 flex items-center px-3 cursor-grab justify-between select-none">
            <div class="flex gap-2">
                <button class="close-btn w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"></button>
                <button class="min-btn w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600"></button>
                <button class="max-btn w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"></button>
            </div>
            <span class="text-xs font-medium text-gray-700">${appName}</span>
        </div>
        <iframe src="apps/${appName}/index.html" class="flex-grow border-none"></iframe>
        <div class="resize-handle w-4 h-4 absolute bottom-0 right-0 cursor-nwse-resize bg-black/10 rounded-br-2xl"></div>
    `;

    windowDiv.addEventListener('mousedown', () => windowDiv.style.zIndex = highestZ++);

    windowDiv.querySelector('.close-btn').addEventListener('click', (e) => { e.stopPropagation(); windowDiv.remove(); });
    windowDiv.querySelector('.min-btn').addEventListener('click', (e) => { e.stopPropagation(); windowDiv.style.display = 'none'; });
    windowDiv.querySelector('.max-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(windowDiv); });

    document.getElementById('desktop').appendChild(windowDiv);
    
    makeDraggable(windowDiv);
    makeResizable(windowDiv);
}

document.getElementById('appbar').addEventListener('click', (e) => {
    const appName = e.target.id;
    if (appName && appName !== 'appbar') {
        openApp(appName);
        }
    }
)