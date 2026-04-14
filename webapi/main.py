import asyncio
import logging
import sys
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.config import ASSETS_DIR, HOMEWORK_DIR, PAGES_DIR, SITE_DIR
from app.dataset_service import prepare_display_assets
from app.routes import api_router


logger = logging.getLogger(__name__)


if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        logger.exception("设置 Windows Selector 事件循环策略失败")


def _prepare_assets_background() -> None:
    try:
        prepare_display_assets()
    except Exception:
        logger.exception("启动预热数据集资源失败")


@asynccontextmanager
async def lifespan(_: FastAPI):
    threading.Thread(target=_prepare_assets_background, daemon=True).start()
    yield


app = FastAPI(title="智聆羽声：围绕 LSTM 系列展开的鸟类音频分类教学平台", version="3.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


if ASSETS_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

if PAGES_DIR.is_dir():
    app.mount("/pages", StaticFiles(directory=PAGES_DIR, html=True), name="pages")

if HOMEWORK_DIR.is_dir():
    app.mount("/homework", StaticFiles(directory=HOMEWORK_DIR), name="homework")


@app.get("/")
async def root_page():
    index_path = SITE_DIR / "index.html"
    if index_path.exists():
        return FileResponse(
            index_path,
            headers={
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )
    return {"message": "Birds API is running"}


@app.get("/index.html")
async def root_page_alias():
    return await root_page()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8087, reload=False)