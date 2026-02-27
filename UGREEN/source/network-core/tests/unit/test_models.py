from app.models.device import Device
from app.models.link import Link


def test_device_has_required_columns():
    cols = {c.name for c in Device.__table__.columns}
    assert {"id", "ip_address", "mac_address", "hostname", "vendor",
            "label", "device_type", "created_at", "updated_at"} <= cols


def test_link_has_required_columns():
    cols = {c.name for c in Link.__table__.columns}
    assert {"id", "source_id", "target_id", "link_type", "created_at"} <= cols
