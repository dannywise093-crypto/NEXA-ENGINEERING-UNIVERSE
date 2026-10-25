from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Any


class ResearchDomain(str, Enum):
    LLM = "llm"
    VISION = "vision"
    PREDICTIVE = "predictive"
    ENGINEERING_ASSISTANT = "engineering_assistant"
    AGENTIC = "agentic"


@dataclass
class ResearchProject:
    name: str
    objective: str
    domains: List[ResearchDomain] = field(default_factory=lambda: [ResearchDomain.LLM])
    metrics: List[str] = field(default_factory=lambda: ["accuracy", "f1", "latency"])
    metadata: Dict[str, Any] = field(default_factory=dict)

    def summary(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "objective": self.objective,
            "domains": [d.value for d in self.domains],
            "metrics": self.metrics,
            "status": "planned",
            "metadata": self.metadata,
        }
