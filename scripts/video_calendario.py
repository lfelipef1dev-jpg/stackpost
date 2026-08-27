#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Grava video do calendario e dashboard com todos os posts agendados."""
import asyncio
import os
import time
from playwright.async_api import async_playwright

with open(r"C:\Users\lfeli\Desktop\StackPost\scripts\.token", "r") as f:
    TOKEN = f.read().strip().lstrip("\ufeff")

SITE = "https://stackpost.expostacker.com.br"
VIDEO_DIR = r"C:\Users\lfeli\Desktop\StackPost\videos_demo"
os.makedirs(VIDEO_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled", "--start-maximized"],
        )
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=VIDEO_DIR,
            record_video_size={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        await page.goto(SITE, wait_until="domcontentloaded")
        await page.evaluate(f"""() => {{ localStorage.setItem('token', '{TOKEN}'); }}""")
        await asyncio.sleep(1)

        # Dashboard
        print("Abrindo dashboard...")
        await page.goto(f"{SITE}/dashboard", wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(5)
        await page.evaluate("window.scrollTo(0, 400)")
        await asyncio.sleep(2)
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(2)

        # Calendar
        print("Abrindo calendario...")
        await page.goto(f"{SITE}/calendar", wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(5)

        # Scroll para mostrar todos os posts
        for j in range(8):
            await page.evaluate(f"window.scrollTo(0, {(j+1) * 300})")
            await asyncio.sleep(1.5)
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(3)

        # Composer mostrando estado limpo
        print("Abrindo composer...")
        await page.goto(f"{SITE}/composer", wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(4)

        await context.close()
        await browser.close()

        # Renomear video
        videos = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".webm")]
        if videos:
            latest = max(videos, key=lambda f: os.path.getmtime(os.path.join(VIDEO_DIR, f)))
            new_path = os.path.join(VIDEO_DIR, f"calendario_dashboard_{int(time.time())}.webm")
            os.rename(os.path.join(VIDEO_DIR, latest), new_path)
            print(f"\nVideo: {new_path}")

asyncio.run(main())
