from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class ExperimentConfig:
    name: str
    objective: str
    dataset_size: int = 0
    model_family: str = "baseline"
    metrics: List[str] = field(default_factory=lambda: ["accuracy", "f1"])
    metadata: Dict[str, Any] = field(default_factory=dict)


def run_experiment(config: ExperimentConfig) -> Dict[str, Any]:
    """Run a lightweight experimental evaluation stub.

    This function is intentionally simple and research-friendly. It can be extended
    to include model benchmarking, dataset validation, and reporting logic.
    """
    summary = {
        "name": config.name,
        "objective": config.objective,
        "dataset_size": config.dataset_size,
        "model_family": config.model_family,
        "metrics": config.metrics,
        "status": "initialized",
        "metadata": config.metadata,
    }

    return {
        **summary,
        "status": "completed",
        "results": {
            metric: 0.0 for metric in config.metrics
        },
    }
