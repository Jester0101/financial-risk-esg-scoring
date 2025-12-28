package com.risk.scoring.web;

import com.risk.scoring.model.RiskInput;
import com.risk.scoring.model.RiskResult;
import com.risk.scoring.service.CompositeRiskService;
import com.risk.scoring.service.HistoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class RiskController {

    private final CompositeRiskService compositeRiskService;
    private final HistoryService historyService;

    public RiskController(CompositeRiskService compositeRiskService, HistoryService historyService) {
        this.compositeRiskService = compositeRiskService;
        this.historyService = historyService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("input", new RiskInput());
        model.addAttribute("history", historyService.getHistory());
        return "index";
    }

    @PostMapping("/calculate")
    public String calculate(@ModelAttribute("input") RiskInput input, Model model) {
        RiskResult result = compositeRiskService.calculate(input);
        historyService.add(result);
        
        model.addAttribute("result", result);
        model.addAttribute("input", input);
        model.addAttribute("history", historyService.getHistory());
        return "index";
    }
}

