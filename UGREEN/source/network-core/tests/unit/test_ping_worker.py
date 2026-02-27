import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../worker'))

import pytest
from unittest.mock import patch, AsyncMock


def test_classify_result_alive():
    from ping_worker import classify_result
    assert classify_result(True) == "alive"


def test_classify_result_unreachable():
    from ping_worker import classify_result
    assert classify_result(False) == "unreachable"


@pytest.mark.asyncio
async def test_ping_host_success():
    from ping_worker import ping_host
    with patch("ping_worker.asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_proc:
        proc = AsyncMock()
        proc.wait = AsyncMock(return_value=0)
        mock_proc.return_value = proc
        result = await ping_host("127.0.0.1")
    assert result is True


@pytest.mark.asyncio
async def test_ping_host_failure():
    from ping_worker import ping_host
    with patch("ping_worker.asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_proc:
        proc = AsyncMock()
        proc.wait = AsyncMock(return_value=1)
        mock_proc.return_value = proc
        result = await ping_host("192.0.2.1")
    assert result is False
