package com.risk.scoring.service;

import com.risk.scoring.model.RiskResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class HistoryService {

    private static final int MAX_HISTORY_SIZE = 20;
    private final List<RiskResult> history = Collections.synchronizedList(new ArrayList<>());

    public void add(RiskResult result) {
        synchronized (history) {
            history.add(result);
            if (history.size() > MAX_HISTORY_SIZE) {
                history.remove(0);
            }
        }
    }

    public List<RiskResult> getHistory() {
        synchronized (history) {
            List<RiskResult> copy = new ArrayList<>(history);
            Collections.reverse(copy);
            return copy;
        }
    }

    public void clear() {
        synchronized (history) {
            history.clear();
        }
    }

    public int size() {
        return history.size();
    }
}

