from app.schemas.device import DeviceCreate, DeviceRead, DevicePatch
from app.schemas.link import LinkCreate, LinkRead


def test_device_create_requires_ip():
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        DeviceCreate()  # brak ip_address


def test_device_read_has_id():
    d = DeviceRead(id="abc", ip_address="10.0.0.1")
    assert d.id == "abc"


def test_link_create_requires_source_and_target():
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        LinkCreate()
