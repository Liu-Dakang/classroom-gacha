# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['C:\\Users\\22903\\Desktop\\python\\classroom-gacha\\backend\\main.py'],
    pathex=[],
    binaries=[],
    datas=[('C:\\Users\\22903\\Desktop\\python\\classroom-gacha\\frontend\\dist', 'dist'), ('C:\\Users\\22903\\Desktop\\python\\classroom-gacha\\backend\\static', 'static')],
    hiddenimports=['uvicorn.logging', 'uvicorn.loops', 'uvicorn.loops.auto', 'uvicorn.protocols', 'uvicorn.protocols.http', 'uvicorn.protocols.http.auto', 'uvicorn.lifespan', 'uvicorn.lifespan.on', 'engineio.async_drivers.threading'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ClassroomGacha',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ClassroomGacha',
)
